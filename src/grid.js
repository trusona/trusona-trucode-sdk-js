import { Point } from './point'

export class Grid {
  constructor(matrix) {
    if (!matrix) {
      throw new Error("A matrix is required to create a Grid")
    }

    this.points = this.generatePoints(matrix)
  }

  generatePoints(matrix) {
    var points = []
    matrix.forEach((column, xCoordinate) => {
      column.forEach((item, yCoordinate) => {
        points.push(new Point(xCoordinate, yCoordinate, item === 1))
      })
    })

    return points
  }

  findPoint(x, y, enabled = true) {
    if (x == null ||
      y == null ||
      x === undefined ||
      y === undefined) {
      throw new Error("Must have both x and y coordinates")
    }
    return this.points.find((p) => {
      return p.x === x && p.y === y && p.enabled === enabled
    })
  }

  disablePoint(point) {
    if(point) {
      point.disable()
    }
  }

  disablePoints(points) {
    points.forEach(this.disablePoint)
  }
}