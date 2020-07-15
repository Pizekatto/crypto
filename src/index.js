import './styles/main.sass'

import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { storage, sorting, value, total } from './middleware'
import { composeWithDevTools } from 'redux-devtools-extension'

import { reducer } from './reducer'
import * as action from './actions'
import Field from './components/field'
import Form from './components/form'
import ui from './ui'

const table = document.getElementById('table')
const tableBody = document.getElementById('table-body')
const tableHeader = document.getElementById('table-header')
const totalElem = document.getElementById('total')
const all = document.getElementById('all')


const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(thunk, storage, sorting, value, total))
)

const displayList = (state) => {

  while (tableBody.firstChild) {
    tableBody.firstChild.remove()
  }

  const { table: { rows } } = state
  if (rows) {
    rows.forEach(elem => {
      if (!elem.edited) {
        const field = new Field(elem, state)
        tableBody.append(field.field)
      } else {
        const form = new Form(elem, state)
        tableBody.append(form.form)
        form.actions()
          .then(({ data }) => {
            store.dispatch(action.applyRow({...elem, ...data }))
          })
          .catch(id => {
            const rows = store.getState().table.rows
            const { exist } = rows.find(row => row.id == id)
            exist
              ?
              store.dispatch(action.toggleEdit(id)) :
              store.dispatch(action.deleteRow(id))
          })
          .finally(() => {
            form.removeListeners()
          })
      }
    })
    let totalValue = store.getState().table.total
    if (totalValue) {
      totalValue = totalValue.toLocaleString('en', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
      all.textContent = "Всего"
      totalElem.textContent = totalValue
    }
  }

}

table.onclick = event => {
  if (event.target.closest('BUTTON')) {
    const button = event.target.closest('BUTTON')
    const row = event.target.closest('.table-row')
    switch (button.id) {
      case 'edit':
        {
          store.dispatch(action.toggleEdit(row.id))
          break
        }
      case 'delete':
        {
          store.dispatch(action.deleteRow(row.id))
          break
        }
      case 'add':
        store.dispatch(action.addBlankForm())
        break
    }
  }
}

tableHeader.onclick = event => {
  if (event.target.closest('li')) {
    const title = event.target.closest('li')
    let { type, reverse } = store.getState().ui.sorting
    store.dispatch(action.sort({
      type: title.id,
      reverse: title.id === type ? !reverse : false
    }))
    const { table: { rows } } = store.getState()
    store.dispatch(action.rewriteTable(rows))

    tableHeader.querySelectorAll('li').forEach(elem => {
      elem.classList.remove('sorted', 'reverse')
    })
    title.classList.add('sorted')
    reverse = store.getState().ui.sorting.reverse
    if (reverse) title.classList.add('reverse')
  }

}

store.subscribe(() => {
  displayList(store.getState())
})
store.dispatch(action.getStartData())

ui()