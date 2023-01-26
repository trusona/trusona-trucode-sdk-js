export class CanvasContext {
  constructor (matrix, params = {}) {
    if (matrix === null || matrix === undefined) {
      throw new Error('A QR Matrix is required')
    }

    if (matrix.length < 1) {
      throw new Error('A non-empty QR Matrix is required')
    }

    if (this.invalidMatrix(matrix)) {
      throw new Error('It appears that the QR Matrix is uneven, ensure rows and columns are equal in size.')
    }

    this.svg = params.svg
    this.matrix = matrix
    this.mergeOverrides(params)
  }

  mergeOverrides (overrides) {
    this.shapeColors = ['#000']
    this.dotColor = '#000'
    this.containerWidth = this.matrix.length

    if (overrides.shapeColors !== null && overrides.shapeColors !== undefined) {
      this.shapeColors = overrides.shapeColors
    }

    if (overrides.dotColor !== null && overrides.dotColor !== undefined) {
      this.dotColor = overrides.dotColor
    }

    if (overrides.containerWidth !== null && overrides.containerWidth !== undefined) {
      this.containerWidth = overrides.containerWidth
    }
  }

  invalidMatrix (matrix) {
    const expected = matrix.length
    return matrix.find((column) => {
      if (column.length !== expected) {
        return true
      }
      return false
    })
  }
}
