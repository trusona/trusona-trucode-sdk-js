import './test_helper'
import { Grid } from '../src/grid'

describe('Grid', () => {
  let matrix

  beforeEach(() => {
    matrix = [[1, 1], [1, 1]]
  })

  describe('creating a Grid', () => {
    it('requires a matrix', () => {
      expect(() => new Grid()).to.throw()
      expect(() => new Grid(matrix)).to.not.throw()
    })

    it('should generate points from the matrix', () => {
      const sut = new Grid(matrix)
      expect(sut.points).to.be.an('array')
    })
  })

  describe('finding Points on the Grid', () => {
    it('requires an x and y coordinate', () => {
      const sut = new Grid(matrix)
      expect(() => sut.findPoint(0, 0)).to.not.throw()
      expect(() => sut.findPoint(0, 1)).to.not.throw()
      expect(() => sut.findPoint(1)).to.throw()
      expect(() => sut.findPoint(1, undefined)).to.throw()
      expect(() => sut.findPoint(1, null)).to.throw()
      expect(() => sut.findPoint(undefined, 1)).to.throw()
      expect(() => sut.findPoint(null, 1)).to.throw()
      expect(() => sut.findPoint()).to.throw()
    })

    context('when the point is found', () => {
      it('should return a Point', () => {
        const sut = new Grid(matrix)
        const point = sut.findPoint(1, 1)
        expect(point.x).to.be.equal(1)
        expect(point.y).to.be.equal(1)
      })
    })

    context('when the point is not found', () => {
      it('should return nothing', () => {
        const sut = new Grid(matrix)
        const point = sut.findPoint(42, 42)
        expect(point).to.not.exist()
      })
    })

    context('when not filtering by enabled', () => {
      it('should not return a disabled Point', () => {
        const sut = new Grid([[0]])
        const point = sut.findPoint(0, 0)
        expect(point).to.not.exist()
      })

      it('should return an enabled Point', () => {
        const sut = new Grid([[1]])
        const point = sut.findPoint(0, 0)
        expect(point.enabled).to.be.true()
      })
    })

    context('when filtering by enabled', () => {
      it('should return a Point only if enabled matches', () => {
        // 1 1
        // 0 0
        const sut = new Grid([[1, 0], [1, 0]])
        expect(sut.findPoint(0, 0, true)).to.exist()
        expect(sut.findPoint(0, 1, true)).to.not.exist()
        expect(sut.findPoint(1, 0, true)).to.exist()
        expect(sut.findPoint(1, 0, false)).to.not.exist()
      })
    })
  })

  describe('disabling a Point on the Grid', () => {
    it('should disable the Point', () => {
      // 1 1
      // 0 0
      const sut = new Grid([[1, 0], [1, 0]])
      const point = sut.findPoint(0, 1)
      sut.disablePoint(point)
      expect(sut.findPoint(0, 1)).to.be.undefined()
    })
  })

  describe('disabling Points on the Grid', () => {
    it('should disable all provided points', () => {
      const sut = new Grid(matrix)
      const points = [sut.findPoint(0, 1), sut.findPoint(1, 1)]
      sut.disablePoints(points)
      expect(sut.findPoint(0, 1)).to.be.undefined()
      expect(sut.findPoint(1, 1)).to.be.undefined()
    })
  })
})
