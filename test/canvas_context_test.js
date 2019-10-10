import './test_helper'
import { CanvasContext } from '../src/canvas_context'

describe('Canvas Context', () => {
  let validParams
  describe('creating a context', () => {
    beforeEach(() => {
      validParams = { matrix: [[1]] }
    })

    it('requires a QR payload in matrix form', () => {
      expect(() => new CanvasContext()).to.throw()
      expect(() => new CanvasContext({})).to.throw()
      expect(() => new CanvasContext({ matrix: null })).to.throw()
      expect(() => new CanvasContext([[1]])).to.not.throw()
    })

    context('when the matrix is not an equally 2D array', () => {
      it('should provide a helpful error', () => {
        // 1 0 0
        // 1 1 1
        // 1 0
        const unevenMatrix = [[1, 1, 1], [0, 1, 0], [0, 1]]
        const evenMatrix = [[1, 1, 1], [0, 1, 0], [0, 1, 0]]
        expect(() => new CanvasContext(unevenMatrix)).to.throw()
        expect(() => new CanvasContext(evenMatrix)).to.not.throw()
      })
    })

    it('optionally accepts a list of configuration options', () => {
      const params = {
        shapeColors: ['#444'],
        dotColor: '#333',
        containerWidth: '512',
        svg: 'my-svg-element-id'
      }
      const sut = new CanvasContext([[1]], params)

      expect(sut.shapeColors).to.include('#444')
      expect(sut.dotColor).to.equal('#333')
      expect(sut.containerWidth).to.equal('512')
    })

    context('when no options are provided', () => {
      it('has sensible defaults', () => {
        const sut = new CanvasContext([[1]], validParams)

        expect(sut.shapeColors).to.include('#000')
        expect(sut.dotColor).to.equal('#000')
        expect(sut.containerWidth).to.equal(1)
      })
    })
  })
})
