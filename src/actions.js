import WS from './ws'
import Data from './data'

const ws = new WS()
const dataInstance = new Data()

import {
  ADD_ROW,
  ADD_COINS_DATA,
  ADD_ALL_EXCHANGES,
  REWRITE_TABLE,
  ADD_CBRF_CURRENCIES,
  CHANGE_SECOND_CURRENCY,
  SORTING
} from './types'


const changeSecondCurrency = payload => ({ type: CHANGE_SECOND_CURRENCY, payload })
const sort = payload => ({ type: SORTING, payload })
const addRow = payload => ({ type: ADD_ROW, payload })
const addCoinsData = payload => ({ type: ADD_COINS_DATA, payload })
const addAllExchanges = payload => ({ type: ADD_ALL_EXCHANGES, payload })
const cbrf = payload => ({ type: ADD_CBRF_CURRENCIES, payload })

const rewriteTable = payload => ({ type: REWRITE_TABLE, payload })

const isEdited = (state) => {
  const { table: { rows } } = state
  return !!rows.find(elem => elem.edited)
}

const isMatch = (obj1, obj2) => {
  return obj1.coin === obj2.coin && obj1.exchange === obj2.exchange
}

const getRowById = (state, id) => {
  return state.table.rows.find(el => el.id == id)
}

const replaceRow = (state, data) => {
  const rows = state.table.rows
  const index = rows.findIndex(elem => elem.id === data.id)
  const before = rows.slice(0, index)
  const after = rows.slice(index + 1)
  return [...before, data, ...after]
}

const withoutRow = (state, id) => {
  const rows = state.table.rows
  return rows.filter(row => row.id != id)
}

const correctNames = (state, enteredData) => {
  const { exchanges } = state
  const { coin, exchange } = enteredData
  return {
    ...enteredData,
    coin: coin.toUpperCase(),
    exchange: exchanges[exchange].name
  }
}

const currency = (coin, exchange, state) => {
  const exchanges = state.exchanges
  const { pairs } = exchanges[exchange.toLowerCase()]
  const { tsyms } = pairs[coin]
  return tsyms.includes('USD') ?
    'USD' : tsyms.includes('USDT') ?
    'USDT' : tsyms.includes('BTC') ? 'BTC' : null
}

const createSubs = (row, state) => {
  return row.map((item) => {
    const { coin, exchange } = item
    const to = currency(coin, exchange, state)
    return { exchange, from: coin, to }
  })
}

const convertPrice = (preparedData, btc) => {
  let { price, to } = preparedData
  if (price) {
    if (to === 'BTC') {
      price *= btc.to.usd
    }
    delete preparedData.to
    return {...preparedData, price }
  }
}

const matchFound = () => {
  return new Promise((resolve, reject) => {
    const answer = confirm("Такая запись уже существует. ОК - Прибавить к существующему значению. ОТМЕНА - перезаписать новым значением")
    answer ? resolve() : reject()
  })
}





const getStartData = () => {
  return async(dispatch, getState) => {
    const cbrfData = await dataInstance.getCBRF()
    dispatch(cbrf(cbrfData))
    const data = await dataInstance.startData()
    const { exchanges, ui: { secondcurrency, sorting } } = data
    dispatch(changeSecondCurrency(secondcurrency))

    const { rows } = JSON.parse(localStorage.getItem('state')) || data
    rows.forEach(item => {
      item.edited = false
      item.completed = false
      dispatch(addRow(item))
    })

    const exchangesWithPairs = await dataInstance.getExchangesWithPairs(exchanges)
    dispatch(addAllExchanges(exchangesWithPairs))
    await dispatch(wsConnect())
    ws.subscribe(createSubs(rows, getState()))


    dispatch(sort(sorting))

    const btcCourse = await dataInstance.getBTCCourse()
    dispatch(addCoinsData(btcCourse))
  }
}

const applyRow = (data) => (dispatch, getState) => {
  const state = getState()
  data = correctNames(state, data)

  if (data.exist) { // в существующем поле

    let row = state.table.rows.find(row => isMatch(row, data))
    if (row) { // в существующем поле, есть такая запись

      row = {...row, amount: data.amount, edited: false }
      let rows = replaceRow(state, row) // записать в то же место
      dispatch(rewriteTable(rows)) // рендер

    } else { // в существующем поле, нет такой записи

      const subsArr = createSubs([data], getState())
      const unsubsArr = createSubs([data.cache], getState())
      ws.unsubscribe(unsubsArr) // отписаться от старой записи

      delete data.cache
      data.subscribed = false
      data.edited = false
      const rows = replaceRow(state, data) // записать в то же место
      dispatch(rewriteTable(rows)) // рендер
      dispatch(wsSubscribe(subsArr))
    }

  } else { // в новом поле

    let row = state.table.rows.find(row => isMatch(row, data) && row.id !== data.id)
    if (row) { // в новом поле, есть такая запись

      matchFound() // вопрос
        .then(() => { // добавить
          row = {...row, amount: row.amount + data.amount, edited: false }
        })
        .catch(() => { // перезаписать
          row = {...row, amount: data.amount, edited: false }
        })
        .finally(() => {
          let rows = replaceRow(state, row) // записать в то же место
          rows = rows.filter(elem => elem.id !== data.id)
          dispatch(rewriteTable(rows)) // рендер
        })

    } else { // в новом поле, нет такой записи

      const subsArr = createSubs([data], getState())
      const rows = withoutRow(state, data.id)
      data.subscribed = false
      data.edited = false

      dispatch(rewriteTable(rows))
      dispatch(addRow(data))
      dispatch(wsSubscribe(subsArr))

    }
  }

}

const wsSubscribe = (subsArr) => () => {
  ws.subscribe(subsArr)
}

const wsConnect = () => {
  return (dispatch, getState) => {
    ws.socket.onmessage = event => {
      // const data = JSON.parse(event.data)
      // if (data.TYPE != "2") {
      // console.log(data);
      // }
      if (!isEdited(getState())) {
        dispatch(responseWs(event.data))
      }
    }
    return new Promise(resolve => {
      let timerId = setTimeout(function tick() {
        if (ws.socket.readyState !== 1) {
          timerId = setTimeout(tick, 50)
        } else {
          resolve(ws.socket.readyState)
        }
      }, 50)

    })
  }
}

const responseWs = (json) => {
  return (dispatch, getState) => {
    const data = JSON.parse(json)
    if (dataInstance.checkData(data)) {
      const btc = getState().coins.btc
      const preparedData = dataInstance.prepareWsData(data)
      const converted = convertPrice(preparedData, btc)
      dispatch(completeRow({...converted, subscribed: true }))
    }
  }
}

const convertCurrency = (price, secondCurrency, cbrf) => {
  const { byn, eur, usd, uah } = cbrf
  switch (secondCurrency) {
    case 'rub':
      return price * usd.value
    case 'uah':
      return price * uah.value
    case 'eur':
      return price * usd.value / eur.value
    case 'byn':
      return price * usd.value / byn.value
  }
}

const completeRow = (data) => {
  return (dispatch, getState) => {
    let rows = getState().table.rows
    const { price } = data
    const secondCurrency = getState().ui.secondcurrency
    const cbrf = getState().cbrf
    const pricesecond = +convertCurrency(price, secondCurrency, cbrf).toFixed(3)
    const newState = rows.map(elem => {
      if (isMatch(elem, data)) {
        const value = +(elem.amount * price).toFixed(3)
        return {
          ...elem,
          ...data,
          completed: true,
          exist: true,
          pricesecond,
          value
        }
      }
      return elem
    })
    dispatch(rewriteTable(newState))
  }
}

const addBlankForm = () => {
  return (dispatch, getState) => {
    const enteredData = {
      edited: true,
      completed: false,
      id: Date.now(),
      exist: false
    }
    if (!isEdited(getState())) {
      // добавить форму
      dispatch(addRow(enteredData))
    }
  }
}

const toggleEdit = id => (dispatch, getState) => {
  const rows = getState().table.rows
  const newState = rows.map(elem => {
    if (elem.id === id) {
      // кеш для отписки
      const cache = !elem.edited ? { coin: elem.coin, exchange: elem.exchange } :
        null
      return {...elem, edited: !elem.edited, cache }
    }
    return elem
  })
  dispatch(rewriteTable(newState))
}

const deleteRow = id => (dispatch, getState) => {
  const state = getState()

  const row = getRowById(state, id)
  if (row.subscribed) {
    const subsArr = createSubs([row], state)
    ws.unsubscribe(subsArr)
  }
  const newState = withoutRow(state, id)

  dispatch(rewriteTable(newState))
}




export { getStartData, toggleEdit, deleteRow, addBlankForm, applyRow, sort, rewriteTable }