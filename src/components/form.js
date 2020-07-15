export default class Form {
  constructor(enteredData, state) {
    const { coin = '', exchange = '', amount = 0, price = 0, id = '', exist } = enteredData
    this.state = state
    this.cbrg = state.cbrf
    this.coin = coin
    this.exchange = exchange || state.exchanges.list[0]
    this.amount = amount
    this.price = price ? price.toFixed(3) : ''
    this.priceSecond = price ? Math.round(this.price * this.cbrg.usd.value) : ''
    this.value = price ? (this.price * amount).toFixed(2) : ''
    this.id = id

    this.exist = exist
    this.allExchanges = state.exchanges

    this.exchangesSelect = this.createSelect(state.exchanges.list, this.exchange, 'exchange', 'exchanges-list')

    const startCoinsList = this.getStartCoinsList()
    this.coinsSelect = this.createSelect(startCoinsList, this.coin, 'coin', 'coins-list')

    this.inputNubmer = this.createInputNumber()
    this.form = this.createForm()
    this.priceUSDElem = this.form.querySelector('#price-usd')
    this.priceSecondElem = this.form.querySelector('#price-second')
    this.valueUSDElem = this.form.querySelector('#value-usd')

  }


  getStartCoinsList() {
    const exchanges = this.state.exchanges
    const { pairs } = exchanges[this.exchange.toLowerCase()]
    return Object.keys(pairs)
  }

  createSelect(list, selected, title, className) {

    const select = document.createElement('SELECT')
    select.id = title
    select.name = title
    select.className = className

    list.forEach(item => {
      const option = new Option(item, item.toLowerCase())
      select.append(option)
    })

    if (selected) {
      const index = [...select.options].findIndex(elem => elem.value === selected.toLowerCase())
      select[index].defaultSelected = true
    }

    return select
  }

  createInputNumber() {
    const amountInput = document.createElement('INPUT')
    amountInput.type = 'number'
    if (this.price == 0) {
      amountInput.step = 1
    } else if (this.price > 0 && this.price < 10) {
      amountInput.step = 5
    } else if (this.price > 10 && this.price < 1000) {
      amountInput.step = 0.01
    } else {
      amountInput.step = 0.0001
    }
    amountInput.min = 0
    amountInput.value = this.amount || 1
    amountInput.name = 'amount'
    amountInput.classList.add('input-amount')

    amountInput.onchange = event => {
      if (this.price) {
        const amount = event.target.value
        this.valueUSDElem.textContent = (amount * this.price).toFixed(2)
      }
    }

    return amountInput
  }

  correctExchangesNames(exchanges, allExchanges) {
    return exchanges.map(elem => {
      const name = allExchanges[elem.toLowerCase()].name
      if (name) return name
    })
  }

  actions() {
    return new Promise((resolve, reject) => {

      const apply = (event) => {
        event.preventDefault()
        const elements = this.form.elements
        const coin = elements.coin.value
        const exchange = elements.exchange.value
        const amount = +elements.amount.value
        const price = this.price ? +this.price : 0
        const lastupdated = Date.now()
        const id = this.id
        resolve({
          data: {
            coin,
            exchange,
            amount,
            price,
            id,
            lastupdated
          },
          id
        })
      }

      const decline = event => {
        event.preventDefault()
        reject(this.id)
      }

      this.applyBtn.addEventListener('click', apply)
      this.declineBtn.addEventListener('click', decline)

      this.removeListeners = () => {
        console.log("Remove Listeners");
        removeEventListener('click', apply)
        removeEventListener('click', decline)
      }
    })
  }

  createForm() {
    const markup = `
      <ul class="table-row table-row_body" id="${this.id}">
        <li class="exchange col" id="exchanges"></li>
        <li class="currency col" id="coins"></li>
        <li class="value col" id="amount-coin"></li>
        <li class="price col" id="price-usd">${this.price}</li>
        <li class="price-second col" id="price-second">${this.priceSecond}</li>
        <li class="amount col">
          <span class="value-usd" id="value-usd">${this.value}</span>
        </li>
        <li class="edit-buttons">
          <div>
            <button class="amount-btn icon icon-ok success" id="apply"></button>
            <button class="amount-btn icon icon-cancel cancel" id="decline"></button>
          </div>
        </li>
      </ul>
    `
    const form = document.createElement('FORM')
    form.name = 'create'
    form.className = 'table-form'
    form.innerHTML = markup
    form.querySelector('.table-row').classList.add('edited')

    const exchangesList = form.querySelector('#exchanges')
    exchangesList.append(this.exchangesSelect)
    if (this.exist) {
      this.exchangesSelect.disabled = true
    }

    const coinsList = form.querySelector('#coins')
    coinsList.append(this.coinsSelect)
    if (!this.exist) {
      this.coinsSelect.disabled = true
    }

    const amountCoin = form.querySelector('#amount-coin')
    amountCoin.append(this.inputNubmer)
    if (!this.exist) {
      this.inputNubmer.disabled = true
    }

    form.oninput = event => {
      switch (event.target) {
        case this.exchangesSelect:
          {
            this.coinsSelect.disabled = false
            const exchange = event.target.value
            this.insertNewCoinsList(exchange, coinsList)
          }
          break
        case this.coinsSelect:
          this.exchangesSelect.disabled = true
          this.inputNubmer.disabled = false
          break
      }
    }

    this.applyBtn = form.querySelector('#apply')
    this.declineBtn = form.querySelector('#decline')

    return form
  }

  insertNewCoinsList(exchange, to) {
    const coins = []
    const pairs = this.allExchanges[exchange].pairs
    for (let key in pairs) {
      coins.push(key)
    }
    const select = this.createSelect(coins, this.coin, 'coin', 'coins-list')
    while (to.firstChild) {
      to.firstChild.remove()
    }
    to.append(select)
    this.coinsSelect = select
  }
}