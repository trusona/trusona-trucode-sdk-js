import { drawTruCode } from './svg_renderer.js'
import { TruCodeRenderer } from './tru_code_renderer.js'
import { TruCodeService } from './tru_code_service.js'

class Trusona {
  static renderTruCode (properties) {
    return new TruCodeRenderer({
      ...properties,
      window: properties.window || globalThis.window
    }).render()
  }

  static getTruCode (truCodeId, truCodeConfig, callback) {
    const service = this._service(truCodeConfig)
    return service.get(truCodeId).then((response) => {
      callback(response.data.paired)
      return response
    })
  }

  static createTruCode (truCodeConfig, callback) {
    const service = this._service(truCodeConfig)
    return service.create().then((response) => {
      callback(response.data)
      return response
    })
  }

  static drawTruCode (element, payload, config = {}) {
    return drawTruCode(element, payload, config)
  }

  static _drawTruCode (element, payload, config = {}) {
    return this.drawTruCode(element, payload, config)
  }

  static _service (config) {
    if (!config?.truCodeUrl) throw new Error('A valid TruCode URL is required.')
    if (!config?.relyingPartyId) throw new Error('A relyingPartyId is required.')
    return new TruCodeService(config.truCodeUrl, config.relyingPartyId)
  }
}

export default Trusona
