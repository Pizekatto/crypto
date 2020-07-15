import { REWRITE_TABLE, ADD_TOTAL } from './types'

export const storage = store => next => action => {
  if (action.type === REWRITE_TABLE) {
    const result = next(action)
    const { table: { rows }, ui } = store.getState()
    const state = { ui }
    state.rows = rows.map(row => {
      const { coin, exchange, amount } = row
      return { coin, exchange, amount }
    })
    localStorage.setItem('state', JSON.stringify(state))
    return result
  }
  return next(action)
}

export const sorting = store => next => action => {
  const { ui: { sorting } } = store.getState()
  if (action.type === REWRITE_TABLE && sorting.type) {
    switch (sorting.type) {
      case 'coin':
      case 'exchange':
        {
          const collator = new Intl.Collator('en')
          action.payload.sort((a, b) => {
            return collator.compare(a[sorting.type], b[sorting.type])
          })
          if (sorting.reverse) {
            action.payload.reverse()
          }
          break
        }
      case 'amount':
      case 'price':
      case 'pricesecond':
      case 'value':
        {
          action.payload.sort((a, b) => {
            return sorting.reverse ?
              b[sorting.type] - a[sorting.type] :
              a[sorting.type] - b[sorting.type]
          })
        }
    }
  }
  return next(action)
}

export const value = () => next => action => {
  if (action.type === REWRITE_TABLE) {
    action.payload = action.payload.map(elem => {
      elem.value = +(elem.amount * elem.price).toFixed(3)
      return elem
    })
  }
  return next(action)
}

export const total = store => next => action => {
  if (action.type === REWRITE_TABLE) {
    const total = action.payload.reduce((acc, elem) => {
      return elem.completed ? acc + Math.round(elem.value) : acc
    }, 0)
    store.dispatch({ type: ADD_TOTAL, total })
  }
  return next(action)
}

export const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd(action.type)
  return result
}