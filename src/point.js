export class Point {
  constructor(x, y, enabled = false) {
    if (x == null ||
      y == null ||
      x === undefined ||
      y === undefined) {
      throw new Error("Must have both x and y coordinates")
    }
    this.x = x
    this.y = y
    this.enabled = enabled
  }

  coords() {
    return [this.x, this.y].join(",")
  }

  disable() {
    this.enabled = false
    return this
  }

  contiguousEasternNeighbors(grid) {
    var point = this
    var neighbors = [point]
    var n

    while (point.hasEasternNeighbor(grid)) {
      n = point.hasEasternNeighbor(grid)
      neighbors.push(n)
      point = n
    }

    return neighbors
  }

  contiguousSouthernNeighbors(grid) {
    var point = this
    var neighbors = [point]
    var n

    while (point.hasSouthernNeighbor(grid)) {
      n = point.hasSouthernNeighbor(grid)
      neighbors.push(n)
      point = n
    }

    return neighbors
  }

  partOfSquare(grid) {
      var east = this.contiguousEasternNeighbors(grid)
      var south = this.contiguousSouthernNeighbors(grid)

      var pointsInSquare = []

      if (east.length === south.length && east.length >= 1 && south.length >= 1) {
          // maybe a square?
          for (var x = 0; x < east.length; x++) {
              for (var y = 0; y < south.length; y++) {
                  var enabled = grid.findPoint(this.x + x, this.y + y)
                  if (enabled) {
                      pointsInSquare.push(enabled)
                  }
              }
          }
      }

      if (pointsInSquare.length === east.length * south.length) {
          return { 'points': pointsInSquare, 'width': east.length }
      }

      return false
  }

  hasNoNeighbors(grid) {
    return !this.hasEasternNeighbor(grid) &&
      !this.hasSouthernNeighbor(grid) &&
      !this.hasNorthernNeighbor(grid) &&
      !this.hasWesternNeighbor(grid)
  }

  hasNeighbor(x, y, grid) {
    var neighbor = grid.points.find(function (p) {
      return x === p.x && y === p.y && p.enabled === true
    })

    return neighbor === undefined ? false : neighbor
  }

  hasEasternNeighbor(grid) {
    return this.hasNeighbor(this.x + 1, this.y, grid)
  }

  hasSouthernNeighbor(grid) {
    return this.hasNeighbor(this.x, this.y + 1, grid)
  }

  hasWesternNeighbor(grid) {
    return this.hasNeighbor(this.x - 1, this.y, grid)
  }

  hasNorthernNeighbor(grid) {
    return this.hasNeighbor(this.x, this.y - 1, grid)
  }
}
