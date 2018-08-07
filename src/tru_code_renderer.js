import SVG from 'svg.js'
import { TruCode } from './tru_code'
import {TruCodePoller} from './tru_code_poller'
import {TruCodeService} from './tru_code_service'

export class TruCodeRenderer {
  constructor(properties) {
    if (!properties.truCodeConfig) {
      throw new Error("Requires a truCodeConfig property. This can be obtained from the Trusona Server SDK.")
    }

    if (!properties.truCodeConfig.truCodeUrl) {
      throw new Error("A valid TruCode URL is required. This can be obtained from the Trusona Server SDK.")
    }

    if (!properties.onPaired) {
      throw new Error("An onPaired handler is required.")
    }

    if (!properties.onError) {
      throw new Error("An onError handler is required.")
    }

    if (!properties.truCodeElement) {
      throw new Error("A DOM element for TruCode drawing is required.")
    }

    if (!properties.truCodeConfig.relyingPartyId) {
      throw new Error("A relyingPartyId is required. This can be obtained from the Trusona Server SDK.")
    }

    if (!properties.truCodeConfig.qr) {
      properties.truCodeConfig.qr = {
        "shapeColors": ["#7B46D1", "#7B46D1", "#7B46D1", "#5856c2", "#4a4cc2", "#5a57b0", "#4d4a97"],
        "dotColor": "#7B46D1",
        "animationConfig": {
          "repeatDelay": 7200
        }
      }
    }

    this.properties = properties

    if( properties.poller) {
      this.poller = properties.poller
    }else{
      const service = new TruCodeService(
        properties.truCodeConfig.truCodeUrl,
        properties.truCodeConfig.relyingPartyId
      )
      this.poller = new TruCodePoller(service)
    }

    this.poller
      .onError(properties.onError)
      .onPaired(properties.onPaired)
      .onPayload(this._drawTruCode.bind(this))
  }

  render() {
    this.poller.poll()
  }

  _drawTruCode(truCode) {
    if (this.properties.onPayload) {
      this.properties.onPayload(truCode.payload)
    }
    this.properties.truCodeElement.innerHTML = ''
    new TruCode(
      SVG(
        this.properties.truCodeElement.id), truCode.payload,
        this.properties.truCodeConfig.qr
    ).draw()
  }
}