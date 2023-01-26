import { CanvasContext } from './canvas_context'
import { Shape } from './shape'
import { Grid } from './grid'
import { Easing } from './easing'
import QRCode from 'qrcode-svg'

// TODO: Improve this class by making it easier to reuse the drawing method and not require
// the payload each time you create a new one so that it's nicer to use an instance of this
// object in the TruCodeRender
export class TruCode {
  constructor (drawing, payload, params = {}) {
    if (!drawing) {
      throw new Error('A drawing that quacks like SVG.js is required')
    }

    if (payload.constructor === Array) {
      this.matrix = payload
    } else {
      this.matrix = this.encodePayloadAsMatrix(payload)
    }

    this.context = new CanvasContext(this.matrix, params)
    this.pairedBeacon = false
    this.grid = new Grid(this.matrix)
    this.animationConfig = this.getAnimationConfig(params)

    this.drawing = drawing.viewbox(
      0,
      0,
      this.getMatrixWidth(),
      this.getMatrixWidth()
    )
  }

  getAnimationConfig (params) {
    const defaults = {
      subSetModulo: 4,
      forwardDuration: 1800,
      forwardDelayMultiplier: 2,
      forwardScaleFactor: 2.25,
      reverseDuration: 1800,
      reverseDelayMultiplier: 2,
      reverseScaleFactor: 1.00,
      repeatDelay: 3600
    }

    if (params && params.animationConfig) {
      const animationConfig = params.animationConfig

      if (animationConfig.subSetModulo) {
        defaults.subSetModulo = parseInt(animationConfig.subSetModulo)
      }

      if (animationConfig.forwardDuration) {
        defaults.forwardDuration = parseInt(animationConfig.forwardDuration)
      }

      if (animationConfig.forwardDelayMultiplier) {
        defaults.forwardDelayMultiplier = parseInt(animationConfig.forwardDelayMultiplier)
      }

      if (animationConfig.forwardScaleFactor) {
        defaults.forwardScaleFactor = parseInt(animationConfig.forwardScaleFactor)
      }

      if (animationConfig.reverseDuration) {
        defaults.reverseDuration = parseInt(animationConfig.reverseDuration)
      }

      if (animationConfig.reverseDelayMultiplier) {
        defaults.reverseDelayMultiplier = parseInt(animationConfig.reverseDelayMultiplier)
      }

      if (animationConfig.reverseScaleFactor) {
        defaults.reverseScaleFactor = parseInt(animationConfig.reverseScaleFactor)
      }

      if (animationConfig.repeatDelay) {
        defaults.repeatDelay = parseInt(animationConfig.repeatDelay)
      }
    }

    return defaults
  }

  encodePayloadAsMatrix (payload) {
    const qrcode = new QRCode({
      content: payload,
      padding: 0,
      ecl: 'L'
    })

    const qrModules = qrcode.qrcode.modules
    const matrix = []

    qrModules.forEach((row) => {
      matrix.push(row.map(r => r === true ? 1 : 0))
    })
    return matrix
  }

  getMatrixWidth () {
    return this.context.matrix[0].length
  }

  getContainerWidth () {
    if (this.context.containerWidth) {
      return this.getMatrixWidth()
    } else {
      return this.context.containerWidth
    }
  }

  hasPairedBeacon () {
    return this.pairedBeacon
  }

  draw () {
    const self = this

    const code = this.drawing.group('code').attr({
      id: 'qr-code',
      fill: '#FFF'
    })

    const length = self.grid.points.length
    const points = self.grid.points

    for (let index = 0; index < length; index++) {
      const point = points[index]
      let shape
      let pointsForDrawing

      if (point === undefined || point.enabled === false) {
        continue
      }

      if (point.hasNoNeighbors(self.grid)) {
        code.rect(1, 1).radius(0.8).attr({
          x: point.x,
          y: point.y,
          fill: this.context.dotColor,
          opacity: 1,
          class: 'tru-code-dot tru-code-drawing'
        })

        self.grid.disablePoint(point)
      } else if (point.partOfSquare(self.grid)) {
        const pointSquare = point.partOfSquare(self.grid)
        shape = new Shape(pointSquare.points)
        shape.drawSquare(code, self.context.shapeColors, pointSquare.width)
        self.grid.disablePoints(pointSquare.points)
      } else {
        const easternNeighbors = point.contiguousEasternNeighbors(self.grid)
        const southernNeighbors = point.contiguousSouthernNeighbors(self.grid)
        let drawToTheEast

        if (easternNeighbors > southernNeighbors) {
          drawToTheEast = true
          pointsForDrawing = easternNeighbors
        } else {
          drawToTheEast = false
          pointsForDrawing = southernNeighbors
        }

        shape = new Shape(pointsForDrawing)
        shape.draw(code, self.context.shapeColors, drawToTheEast)
        self.grid.disablePoints(pointsForDrawing)
      }
    }

    // Start the animation
    this.runAnimations(code.select('.tru-code-dot'))
  }

  runAnimations (circles) {
    const self = this
    const subSetModulo = this.animationConfig.subSetModulo
    const forwardDuration = this.animationConfig.forwardDuration
    const forwardDelayMultiplier = this.animationConfig.forwardDelayMultiplier
    const forwardScaleFactor = this.animationConfig.forwardScaleFactor
    const reverseDuration = this.animationConfig.reverseDuration
    const reverseDelayMultiplier = this.animationConfig.reverseDelayMultiplier
    const reverseScaleFactor = this.animationConfig.reverseScaleFactor
    const repeatDelay = this.animationConfig.repeatDelay

    circles.each(function (iterator) {
      this.animate().stop(false, true)
      if (iterator % subSetModulo === 0) {
        this.animate({
          ease: Easing.bounce,
          duration: forwardDuration,
          delay: forwardDelayMultiplier * iterator
        })
          .scale(forwardScaleFactor).animate({
            ease: Easing.bounce,
            duration: reverseDuration
          })
          .scale(reverseScaleFactor)
          .delay(reverseDelayMultiplier * iterator)
      }

      if (circles.last() === this) {
        setTimeout(function () {
          self.runAnimations(circles)
        }, repeatDelay)
      }
    })
  }
}
