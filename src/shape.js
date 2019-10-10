import first from 'lodash/first'
import shuffle from 'lodash/shuffle'
import uniq from 'lodash/uniq'
import min from 'lodash/min'

export class Shape {
  constructor (squares) {
    this.squares = squares
  }

  drawSquare (drawing, shapeColors, width) {
    let filledWith = '#000000'

    if (shapeColors.constructor === Array) {
      if (shapeColors.length > 0) {
        filledWith = first(shuffle(shapeColors))
      }
    } else {
      filledWith = shapeColors
    }

    var point = first(this.squares)

    var rect = drawing.rect(width, width).attr({
      x: point.x,
      y: point.y
    }).radius(1 / width)

    rect.attr({
      fill: filledWith,
      opacity: 1,
      class: 'tru-code-shape tru-code-drawing'
    })
  }

  draw (drawing, shapeColors, drawToTheEast) {
    var squares = uniq(this.squares, function (element) {
      return element.x + ',' + element.y + ',' + element.w + ',' + element.h
    })

    var minX = min(squares, function (s) {
      return s.x
    })

    let filledWith = '#000000'

    if (shapeColors.constructor === Array) {
      if (shapeColors.length > 0) {
        filledWith = first(shuffle(shapeColors))
      }
    } else {
      filledWith = shapeColors
    }

    var rect
    if (drawToTheEast) {
      rect = drawing.rect(squares.length, 1)
    } else {
      rect = drawing.rect(1, squares.length)
    }

    rect.radius(0.5).attr({
      x: minX.x,
      y: minX.y,
      fill: filledWith,
      opacity: 1,
      class: 'tru-code-shape tru-code-drawing'
    })
  }
}
