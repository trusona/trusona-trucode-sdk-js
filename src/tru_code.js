import { matrixFor } from './matrix.js'
import { drawTruCode } from './svg_renderer.js'

export class TruCode {
  constructor (drawing, payload, params = {}) {
    if (!drawing) throw new Error('A DOM drawing element is required.')
    this.drawing = drawing
    this.payload = payload
    this.matrix = matrixFor(payload)
    this.params = params
    this.pairedBeacon = false
  }

  draw () {
    return drawTruCode(this.drawing, this.matrix, this.params)
  }

  hasPairedBeacon () {
    return this.pairedBeacon
  }
}
