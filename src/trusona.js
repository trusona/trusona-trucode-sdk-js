import SVG from 'svg.js'
import { TruCode } from './tru_code'
import { TruCodeRenderer } from './tru_code_renderer'
import { TruCodeService } from './tru_code_service'

class Trusona {
  static renderTruCode(properties) {
    new TruCodeRenderer(properties).render()
  }

  static getTruCode(truCodeId, truCodeConfig, callback) {
    const truCodeService = new TruCodeService(truCodeConfig.truCodeUrl, truCodeConfig.relyingPartyId)
    return truCodeService.get(truCodeId).then((response) => callback(response.data.paired))
  }

  static createTruCode(truCodeConfig, callback) {
    const truCodeService = new TruCodeService(truCodeConfig.truCodeUrl, truCodeConfig.relyingPartyId)
    return truCodeService.create().then((response) => callback(response.data)) // {id, expires_at, payload}
  }

  static _drawTruCode(element, payload, config) {
    element.innerHTML = ''
    new TruCode(SVG(element.id), payload, config).draw()
  }
}

export default Trusona