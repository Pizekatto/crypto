const state = {
  table: {
    rows: [
      {
      	id: 0,
        coin: 0,
        exchange: 'Bitfinex',
        amount: 0,
        price:0,
        value: 0,
        edited: false,
        lastUpdated: 0
      },
    ],
    sort: {
      by: 'coin',
      direction: 'asc'
    },
    blocked: false
  },
  ui: {
    buttons: {
      edit: {
        disable: false
      },
      delete: {
        disable: false
      },
      apply: {
        disable: false
      },
      decline: {
        disable: false
      }
    }
  },
  coins: [
  	"BTC", "ETH", "XRP"
  ]
  exchanges: [
  	"Coinbase", "Bitfinex", "Binance"
  ]
}