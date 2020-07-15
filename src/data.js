export default class Data {
  constructor() {
    this.key = 'bfa3821152c6b9a655b29d87136b35ab2689aa121364a173900ab5bd6e8d3d9d'
    this.apiBaseURL = 'https://min-api.cryptocompare.com'
    this.infoBaseURL = 'https://cryptocompare.com'
  }

  generateURL(base, url) {
    return new URL(url, base)
  }

  checkData(data) {
    const { TYPE, FROMSYMBOL, MARKET, PRICE } = data
    return TYPE == 2 && FROMSYMBOL && MARKET && PRICE
  }

  prepareWsData(data) {
    const {
      FROMSYMBOL: coin,
      MARKET: exchange,
      PRICE: price,
      LASTUPDATE: lastupdated,
      TOSYMBOL: to
    } = data
    return { coin, exchange, price, lastupdated, to, id: coin + lastupdated }
  }

  async getBTCCourse() {
    const href = '/data/price'
    let url = this.generateURL(this.apiBaseURL, href)
    const options = { api_key: this.key, fsym: 'BTC', tsyms: 'USD,USDT,RUB' }
    for (let option in options) {
      url.searchParams.append(option, options[option])
    }
    const course = await this.getData(url)
    const obj = { btc: { to: {} } }
    for (let key in course) {
      obj.btc.to[key.toLowerCase()] = course[key]
    }
    return obj
  }

  async getAllCoins() {
    const href = '/data/blockchain/list'
    const options = { api_key: this.key }
    const coinsData = await this.extractData(href, options)
    let coins = []
    for (let coin in coinsData) {
      const { symbol: ticker } = coinsData[coin]
      coins.push(ticker)
    }
    return coins
  }

  async getAllExchanges() {
    const href = '/data/exchanges/general'
    const options = { api_key: this.key }
    const data = await this.extractData(href, options)
    let exchanges = {}
    for (let exchange in data) {
      const {
        AffiliateURL: url,
        Name: name,
        LogoUrl: logo
      } = data[exchange]
      exchanges[name.toLowerCase()] = { name, url, logo }
    }
    return exchanges
  }

  async getExchangesWithPairs() {
    const href = '/data/v4/all/exchanges'
    const { exchanges: visibleExchanges } = await this.startData()
    const options = { api_key: this.key }
    const { exchanges } = await this.extractData(href, options)
    const obj = { list: [] }
    for (let key in exchanges) {
      if (visibleExchanges.includes(key.toLowerCase())) {
        obj.list.push(key)
        obj[key.toLowerCase()] = {}
        obj[key.toLowerCase()].name = key

        const currentPairs = exchanges[key].pairs
        const entries = Object.entries(currentPairs)
        const collator = new Intl.Collator('en')
        entries.sort((a, b) => collator.compare(a[0], b[0]))

        obj[key.toLowerCase()].pairs = Object.fromEntries(entries)
        const pairs = obj[key.toLowerCase()].pairs
        for (let key in pairs) {
          pairs[key].tsyms = Object.keys(pairs[key].tsyms)
        }
      }
    }
    return obj
  }

  async extractData(href, options) {
    let url = this.generateURL(this.apiBaseURL, href)
    if (options) {
      for (let option in options) {
        url.searchParams.append(option, options[option])
      }
    }
    const { Data: data } = await this.getData(url)
    return data
  }

  startData = async() => {
    const response = await fetch('./startData.json')
    return response.json()
  }

  getData = async(url) => {
    try {
      const response = await fetch(url,
        // {
        //   headers: {
        //     'Authorization': "Apikey " + this.key
        //   }
        // }
      )
      return response.json()
    } catch (error) {
      console.error(error)
    }
  }

  getCBRF = async() => {

    const cache = JSON.parse(localStorage.getItem('cbrf'))
    if (cache) {
      const diff = Date.now() - cache.lastupdated.timestamp
      const oneday = 1000 * 60 * 60 * 24

      if (diff < oneday) {
        // const hours = Math.trunc(diff / 1000 / 60 / 60)
        // const minutes = Math.round(diff / 1000 / 60 % 60)
        // console.log("C момента обновления курса ЦБ прошло", `${hours}ч ${minutes}м`)
        return cache
      }
    }

    // console.log("Загружаем данные ЦБ из API")
    const data = await this.cbrf()
    localStorage.setItem('cbrf', JSON.stringify(data))

    return data

  }

  cbrf = async() => {
    const url = 'https://www.cbr-xml-daily.ru/daily_json.js'
    const response = await fetch(url, { cache: 'no-store' })
    const json = await response.json()
    let { Timestamp: timestamp } = json
    timestamp = Date.parse(timestamp)
    const datetime = new Date(timestamp).toLocaleString()
    const { BYN, EUR, USD, UAH } = json.Valute
    let currencies = { BYN, EUR, USD, UAH }
    const obj = { lastupdated: { timestamp, datetime } }
    for (let currency in currencies) {
      obj[currency.toLowerCase()] = {}
      obj[currency.toLowerCase()].code = currencies[currency].CharCode
      obj[currency.toLowerCase()].value = currencies[currency].Value
    }
    return obj
  }

}