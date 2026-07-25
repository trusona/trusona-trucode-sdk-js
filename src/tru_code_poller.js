const MAX_ERRORS = 5
const MIN_RENEWAL_WAIT = 5000
const RENEWAL_BUFFER = 10000

export class TruCodePoller {
  constructor (trucodeService, view = globalThis.window, options = {}) {
    this.trucodeService = trucodeService
    this.view = view
    this.pollInterval = options.pollInterval ?? 500
    this.maximumErrors = options.maximumErrors ?? MAX_ERRORS
    this.completed = false
    this.running = false
    this.errors = 0
    this.payloadHandler = () => {}
    this.pairedHandler = () => {}
    this.errorHandler = () => {}
    this.timers = new Set()
    this.completeOnUnload = () => this.stop()
    view?.addEventListener?.('pagehide', this.completeOnUnload)
    view?.addEventListener?.('beforeunload', this.completeOnUnload)
  }

  onPayload (handler) {
    this.payloadHandler = typeof handler === 'function' ? handler : () => {}
    return this
  }

  onPaired (handler) {
    this.pairedHandler = typeof handler === 'function' ? handler : () => {}
    return this
  }

  onError (handler) {
    this.errorHandler = typeof handler === 'function' ? handler : () => {}
    return this
  }

  poll () {
    if (this.completed || this.running) return Promise.resolve()
    this.running = true
    return this._issue()
      .catch(error => this._handleError(error))
      .finally(() => { this.running = false })
  }

  async _issue () {
    const response = await this.trucodeService.create()
    if (this.completed) return
    this.errors = 0
    this.current = response.data
    this.payloadHandler(this.current)
    this._scheduleRenewal(this.current)
    this._scheduleStatusPoll(this.current.id, 0)
  }

  _scheduleRenewal (truCode) {
    if (!Number.isFinite(truCode.expires_at)) return
    const wait = Math.max(
      MIN_RENEWAL_WAIT,
      truCode.expires_at - Date.now() - RENEWAL_BUFFER
    )
    this._schedule(() => {
      if (this.current?.id !== truCode.id || this.completed) return
      this.running = false
      this.poll()
    }, wait)
  }

  _scheduleStatusPoll (id, delay = this.pollInterval) {
    this._schedule(async () => {
      if (this.completed || this.current?.id !== id) return
      try {
        const response = await this.trucodeService.get(id)
        this.errors = 0
        if (response.data?.paired) {
          this.pairedHandler(response.data.id || id)
          this.stop()
          return
        }
      } catch (error) {
        if (this._handleError(error)) return
      }
      this._scheduleStatusPoll(id)
    }, delay)
  }

  _handleError (error) {
    this.errors += 1
    if (this.errors < this.maximumErrors) return false
    this.errorHandler(error)
    this.stop()
    return true
  }

  _schedule (callback, delay) {
    const timer = (this.view?.setTimeout || globalThis.setTimeout)(() => {
      this.timers.delete(timer)
      callback()
    }, delay)
    this.timers.add(timer)
    return timer
  }

  stop () {
    if (this.completed) return
    this.completed = true
    const clear = this.view?.clearTimeout || globalThis.clearTimeout
    this.timers.forEach(timer => clear(timer))
    this.timers.clear()
    this.view?.removeEventListener?.('pagehide', this.completeOnUnload)
    this.view?.removeEventListener?.('beforeunload', this.completeOnUnload)
    this.payloadHandler = () => {}
    this.pairedHandler = () => {}
    this.errorHandler = () => {}
  }

  _completed () {
    this.stop()
  }
}
