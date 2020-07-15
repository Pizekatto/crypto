export default class WS {
  constructor() {
    this.apiBaseURL = 'wss://streamer.cryptocompare.com/v2'
    this.key = 'bfa3821152c6b9a655b29d87136b35ab2689aa121364a173900ab5bd6e8d3d9d'
    this.url = this.generateURL(this.apiBaseURL, {
      'api_key': this.key
    })
    this.socket = new WebSocket(this.url)
    this.socket.onclose = event => {
      if (event.wasClean) {
        console.log("Соединение закрыто чисто, код", event.code)
        console.log("Причина", event.reason)
      } else {
        console.log("Соединение прервано, код", event.code)
      }
    }
    this.socket.onopen = () => {
      console.log("Соединение установлено")
      console.log("Ready state", this.socket.readyState);
    }
    this.socket.onerror = err => console.log(err.message)

    // setTimeout(() => this.socket.close(), 8000)
  }

  generateURL(base, options) {
    const url = new URL(base)
    if (options) {
      for (let option in options) {
        url.searchParams.append(option, options[option])
      }
    }
    return url
  }

  capitalize(str) {
    str = str.trim().toLowerCase()
    return str[0].toUpperCase() + str.slice(1)
  }

  createSub(exchange, from, to) {
    return "2~" + exchange + "~" + from + "~" + to
  }

  createSubs = (subsArr) => {
    return subsArr.map(({ exchange, from, to }) => {
      return this.createSub(exchange, from, to)
    })
  }

  subscribe(subsArr) {
    const subs = this.createSubs(subsArr)
    console.log("subscribe -> subs", subs)
    this.socket.send(JSON.stringify({
      format: "streamer",
      action: "SubAdd",
      subs
    }))
  }

  unsubscribe(subsArr) {
    const subs = this.createSubs(subsArr)
    this.socket.send(JSON.stringify({
      action: "SubRemove",
      subs
    }))
  }

}