import { drawTruCode } from './svg_renderer.js'
import { TruCodePoller } from './tru_code_poller.js'
import { TruCodeService } from './tru_code_service.js'

export class TruCodeRenderer {
  constructor (properties = {}) {
    const config = properties.truCodeConfig
    if (!config) throw new Error('Requires a truCodeConfig property.')
    if (!config.truCodeUrl) throw new Error('A valid TruCode URL is required.')
    if (!config.relyingPartyId) throw new Error('A relyingPartyId is required.')
    if (!properties.truCodeElement) {
      throw new Error('A DOM element for TruCode drawing is required.')
    }
    if (typeof properties.onPaired !== 'function') {
      throw new Error('An onPaired handler is required.')
    }
    if (typeof properties.onError !== 'function') {
      throw new Error('An onError handler is required.')
    }

    this.properties = properties
    this.poller = properties.poller || new TruCodePoller(
      new TruCodeService(
        config.truCodeUrl,
        config.relyingPartyId,
        properties.restClient,
        properties.fetch
      ),
      properties.window
    )
    this.poller
      .onError(properties.onError)
      .onPaired(properties.onPaired)
      .onPayload(this._drawTruCode.bind(this))
  }

  render () {
    this.poller.poll()
    return this
  }

  stop () {
    this.drawing?.stop()
    this.poller.stop()
  }

  _drawTruCode (truCode) {
    this.properties.onPayload?.(truCode.payload)
    this.drawing?.stop()
    this.drawing = drawTruCode(
      this.properties.truCodeElement,
      truCode.payload,
      this.properties.truCodeConfig.qr || {}
    )
  }
}
