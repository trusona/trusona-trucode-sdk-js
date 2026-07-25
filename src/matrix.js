import QRCode from 'qrcode'

export const matrixFor = (payload) => {
  if (Array.isArray(payload)) return normalizeMatrix(payload)
  if (typeof payload !== 'string' || payload.length === 0) {
    throw new Error('A non-empty TruCode payload is required.')
  }

  const modules = QRCode.create(payload, {
    errorCorrectionLevel: 'L'
  }).modules
  const matrix = []
  for (let y = 0; y < modules.size; y += 1) {
    const row = []
    for (let x = 0; x < modules.size; x += 1) {
      row.push(modules.get(x, y) ? 1 : 0)
    }
    matrix.push(row)
  }
  return matrix
}

export const normalizeMatrix = (matrix) => {
  if (matrix.length === 0 || !Array.isArray(matrix[0])) {
    throw new Error('A non-empty square QR matrix is required.')
  }
  const size = matrix.length
  if (matrix.some(row => !Array.isArray(row) || row.length !== size)) {
    throw new Error('The QR matrix must be square.')
  }
  return matrix.map(row => row.map(value => value ? 1 : 0))
}
