import { combineReducers } from 'redux'

import { ADD_ROW, ADD_TOTAL, REWRITE_TABLE, ADD_COINS_DATA, ADD_ALL_EXCHANGES, ADD_CBRF_CURRENCIES, CHANGE_SECOND_CURRENCY, SORTING } from './types'

const rows = (rows = [], action) => {
  switch (action.type) {
    case ADD_ROW:
      return [...rows, action.payload]
    default:
      return rows
  }
}

const table = (table = {}, action) => {
  switch (action.type) {
    case ADD_ROW:
      return {...table, rows: rows(table.rows, action) }
    case ADD_TOTAL:
      return {...table, total: action.total }
    case REWRITE_TABLE:
      return {...table, rows: action.payload }
    default:
      return table
  }
}

const ui = (ui = {}, action) => {
  switch (action.type) {
    case CHANGE_SECOND_CURRENCY:
      return {...ui, secondcurrency: action.payload }
    case SORTING:
      return {...ui, sorting: action.payload }
    default:
      return ui
  }
}

const coins = (coins = [], action) => {
  switch (action.type) {
    case ADD_COINS_DATA:
      return action.payload
    default:
      return coins
  }
}

const exchanges = (exchanges = {}, action) => {
  switch (action.type) {
    case ADD_ALL_EXCHANGES:
      return {...exchanges, ...action.payload }
    default:
      return exchanges
  }
}

const cbrf = (cbrf = {}, action) => {
  if (action.type === ADD_CBRF_CURRENCIES) {
    return {...cbrf, ...action.payload }
  }
  return cbrf
}

export const reducer = combineReducers({ table, ui, coins, exchanges, cbrf })