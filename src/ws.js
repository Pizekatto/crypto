export default class WS {
  constructor() {
    this.url = 'wss://streamer.cryptocompare.com/v2'
    this.key = 'a6483e3a0a61a95c3954df3d546c8b31ddafdfd6330ea0b43079563a88f1a32a'
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
        // console.log("Ready state", this.socket.readyState);
    }
    this.socket.onerror = err => console.log(err.message)

    setTimeout(() => this.socket.close(), 8000)
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
    this.socket.send(JSON.stringify({
      api_key: this.key,
      format: "streamer",
      action: "SubAdd",
      subs
    }))
  }

  unsubscribe(subsArr) {
    const subs = this.createSubs(subsArr)
    this.socket.send(JSON.stringify({
      api_key: this.key,
      action: "SubRemove",
      subs
    }))
  }

}