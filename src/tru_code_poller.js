const MAX_ERRORS = 5
const MIN_WAIT = 5000
const BUFFER = 10000

export class TruCodePoller {
  constructor (trucodeService, window) {
    this.trucodeService = trucodeService

    this.completed = false
    this.pollCount = 0
    this.errors = 0

    this.payloadHandler = () => {}
    this.pairedHandler = () => {}
    this.errorHandler = () => {}

    window.addEventListener('beforeunload', () => this._completed())
  }

  onPayload (handler) {
    this.payloadHandler = handler
    return this
  }

  onPaired (handler) {
    this.pairedHandler = handler
    return this
  }

  onError (handler) {
    this.errorHandler = handler
    return this
  }

  poll () {
    if (this.completed) {
      return Promise.resolve()
    }
    if (this.errors >= MAX_ERRORS) {
      this.errorHandler()
      this._completed()
      return Promise.resolve()
    }
    if (this.pollCount > 1) {
      return Promise.resolve()
    }
    this.pollCount++
    return this._getTrucode()
      .then(this._scheduleNextTrucode.bind(this))
      .then(this._get.bind(this))
      .then(this._handleResponse.bind(this))
      .catch(this._handleError.bind(this))
  }

  _getTrucode () {
    return this.trucodeService.create()
      .then((response) => {
        this.payloadHandler(response.data)
        return response.data
      })
  }

  _scheduleNextTrucode (currentTrucode, timeout = setTimeout) {
    const timeToExpire = currentTrucode.expires_at - new Date().getTime()
    timeout(this.poll.bind(this), Math.max(MIN_WAIT, timeToExpire - BUFFER))
    return currentTrucode
  }

  _get (trucode) {
    return this.trucodeService.get(trucode.id)
  }

  _handleResponse (response) {
    if (response.data.paired) {
      this.pairedHandler(response.data.id)
      this._completed()
    }
    this._pollComplete()
  }

  _handleError () {
    this.errors++
    this._pollComplete()
  }

  _pollComplete () {
    this.pollCount--
    if (this.pollCount < 1) {
      this.poll()
    }
  }

  _completed () {
    this.completed = true

    this.payloadHandler = () => {}
    this.pairedHandler = () => {}
    this.errorHandler = () => {}
  }
}
