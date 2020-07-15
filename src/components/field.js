export default class Field {
  constructor(enteredData = {}, state) {
    const { coin = '', exchange = '', amount = 0, price = 0, id = '', pricesecond, value, completed } = enteredData
    this.state = state
    this.btc = state.coins.btc
    this.cbrf = state.cbrf
    this.coin = coin
    this.exchange = exchange
    this.amount = amount
    this.price = price || ''
    this.priceSecond = pricesecond || ''
    this.value = value || ''
    this.id = id
    this.completed = completed
  }

  get field() {

    const price = this.price.toLocaleString('en', { style: 'currency', currency: 'USD', minimumFractionDigits: 3 })

    const priceSecond = this.priceSecond.toLocaleString('ru', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })

    const value = this.value.toLocaleString('en', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })


    const loader = "загрузка..."

    const markup = `
      <li class="exchange col">${this.exchange}</li>
      <li class="currency col">${this.coin}</li>
      <li class="value col">${this.amount}</li>
      <li class="price col">${price}</li>
      <li class="price-second col">${this.completed ? priceSecond : loader}</li>
      <li class="amount col">
        <span class="amount-value">${value}</span>
      </li>
      <li class="edit-buttons">
        <div>
          <button class="amount-btn icon icon-edit success" id="edit"></button>
          <button class="amount-btn icon icon-delete cancel" id="delete"></button>
        </div>
      </li>
    `
    const row = document.createElement('UL')
    row.className = 'table-row table-row_body'
    row.id = this.id
    row.innerHTML = markup
    return row
  }

}