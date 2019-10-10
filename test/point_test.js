import './test_helper'
import { Point } from '../src/point'
import { Grid } from '../src/grid'

describe('Point', () => {
  describe('creating a point', () => {
    it('requires an x and y coordinate', () => {
      expect(() => new Point(1, 0)).to.not.throw()
      expect(() => new Point(1, 2)).to.not.throw()
      expect(() => new Point(1, null)).to.throw()
      expect(() => new Point(null, 2)).to.throw()
      expect(() => new Point(1)).to.throw()
    })

    it('optionally accepts a enabled status', () => {
      const sut = new Point(1, 0)
      expect(sut.enabled).to.be.false()
    })

    context('with enabled populated', () => {
      it('should be true if enabled', () => {
        const sut = new Point(1, 0, true)
        expect(sut.enabled).to.be.true()
      })

      it('should be false if not enabled', () => {
        const sut = new Point(1, 0, false)
        expect(sut.enabled).to.be.false()
      })
    })
  })

  describe('disabling a Point', () => {
    it('should return itself', () => {
      const sut = new Point(1, 0, true)
      expect(sut.disable()).to.be.equal(sut)
    })
    context('when the Point is currently enabled', () => {
      it('should be disabled', () => {
        const sut = new Point(1, 0, true)
        sut.disable()
        expect(sut.enabled).to.be.false()
      })
    })
    context('when the Point is currently disabled', () => {
      it('should remain disabled', () => {
        const sut = new Point(1, 0, false)
        sut.disable()
        expect(sut.enabled).to.be.false()
      })
    })
  })

  describe('coordinates', () => {
    it('knows about its coordinates', () => {
      const sut = new Point(4, 5)
      expect(sut.coords()).to.be.equal('4,5')
    })
  })

  describe('detecting neighbors', () => {
    context('when there are no neighbors', () => {
      it('the point should know is has no neighbors', () => {
        const grid = new Grid([])
        const sut = new Point(4, 5)

        expect(sut.hasNoNeighbors(grid)).to.be.true()
      })
    })
    context('where there are neighbors', () => {
      context('and they are not enabled', () => {
        it('should not treat them as neighbors', () => {
          // 0 0 0
          // 0 1 0
          // 0 0 0
          const grid = new Grid([[0, 0, 0], [0, 1, 0], [0, 0, 0]])
          const sut = new Point(1, 1)

          expect(sut.hasNoNeighbors(grid)).to.be.true()
        })
      })
      context('and they are to the east', () => {
        it('should know that there is a neighbor', () => {
          // 1 1
          // 0 0
          const grid = new Grid([[1, 0], [1, 0]])
          const sut = new Point(0, 0)

          expect(sut.hasNoNeighbors(grid)).to.be.false()
        })
      })
      context('and they are to the south', () => {
        it('should know that there is a neighbor', () => {
          // 1 0
          // 1 0
          const grid = new Grid([[1, 1], [0, 0]])
          const sut = new Point(0, 0)

          expect(sut.hasNoNeighbors(grid)).to.be.false()
        })
      })
      context('and they are to the north', () => {
        it('should know that there is a neighbor', () => {
          // 1 0
          // 1 0
          const grid = new Grid([[1, 1], [0, 0]])
          const sut = new Point(0, 1)

          expect(sut.hasNoNeighbors(grid)).to.be.false()
        })
      })
      context('and they are to the west', () => {
        it('should know that there is a neighbor', () => {
          // 1 1
          // 0 0
          const grid = new Grid([[1, 0], [1, 0]])
          const sut = new Point(1, 0)

          expect(sut.hasNoNeighbors(grid)).to.be.false()
        })
      })
    })
  })

  describe('looking for connected neighbors', () => {
    describe('as part of a square', () => {
      context('and the point is part of an island square', () => {
        it('then it should know the other points in the square', () => {
          // 0 0 0 0
          // 0 1 1 0
          // 0 1 1 0
          // 0 0 0 0
          const grid = new Grid(
            [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]
          )
          const sut = grid.findPoint(1, 1)
          const result = sut.partOfSquare(grid)
          expect(result.points.length).to.eq(4)
        })
      })
      context('and the point is part of a square', () => {
        it('then it should know the other points in the square', () => {
          // 1 1 1 0
          // 1 1 1 0
          // 1 1 1 0
          // 0 0 0 0
          const grid = new Grid(
            [[1, 1, 1, 0], [1, 1, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0]]
          )
          const sut = grid.findPoint(0, 0)
          const result = sut.partOfSquare(grid)
          expect(result.points.length).to.eq(9)
        })

        it('and it should know how wide the square is', () => {
          // 1 1 1 0
          // 1 1 1 0
          // 1 1 1 0
          // 0 0 0 0
          const grid = new Grid(
            [[1, 1, 1, 0], [1, 1, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0]]
          )
          const sut = grid.findPoint(0, 0)
          const result = sut.partOfSquare(grid)
          expect(result.width).to.equal(3)
        })
      })

      context('and the point is not part of a square', () => {
        it('then it should know it is not part of a square', () => {
          // 1 1 1 0
          // 0 1 1 0
          // 1 1 1 0
          // 0 0 0 0
          const grid = new Grid(
            [[1, 0, 1, 0], [1, 1, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0]]
          )
          const sut = grid.findPoint(0, 0)
          const result = sut.partOfSquare(grid)
          expect(result).to.be.false()
        })
      })

      context('and the point is a square with the middle missing', () => {
        it('then it should know it is not part of a square', () => {
          // 1 1 1 1
          // 1 0 0 0
          // 1 0 1 1
          // 1 0 1 1
          const grid = new Grid(
            [[1, 1, 1, 1], [1, 0, 0, 0], [1, 0, 1, 1], [1, 0, 1, 1]]
          )
          const sut = grid.findPoint(0, 0)
          const result = sut.partOfSquare(grid)
          expect(result).to.be.false()
        })
      })
    })

    describe('towards the east', () => {
      context('and some are found', () => {
        it('should include itself in the list of neighbors', () => {
          // 1 1 1
          // 1 0 1
          // 0 1 0
          const grid = new Grid([[1, 1, 0], [1, 0, 1], [1, 1, 0]])
          const sut = grid.findPoint(0, 0)
          const neighbors = sut.contiguousEasternNeighbors(grid)
          expect(neighbors[0].x).to.eq(0)
          expect(neighbors[0].y).to.eq(0)
          expect(neighbors[0].enabled).to.be.true()
        })

        it('they should be collected as easterly neighbors', () => {
          // 1 1 1
          // 1 0 1
          // 0 1 0
          const grid = new Grid([[1, 1, 0], [1, 0, 1], [1, 1, 0]])
          const sut = grid.findPoint(0, 0)
          const neighbors = sut.contiguousEasternNeighbors(grid)
          expect(neighbors.length).to.equal(3)
          expect(neighbors[0].x).to.eq(0)
          expect(neighbors[0].y).to.eq(0)
          expect(neighbors[0].enabled).to.be.true()

          expect(neighbors[1].x).to.eq(1)
          expect(neighbors[1].y).to.eq(0)
          expect(neighbors[1].enabled).to.be.true()

          expect(neighbors[2].x).to.eq(2)
          expect(neighbors[2].y).to.eq(0)
          expect(neighbors[2].enabled).to.be.true()
        })
      })

      context('and none are found', () => {
        it('should just include itself in the list of neighbors', () => {
          // 1 0 0
          // 1 0 1
          // 0 1 0
          const grid = new Grid([[1, 1, 0], [0, 0, 1], [0, 1, 0]])
          const sut = grid.findPoint(0, 0)
          const neighbors = sut.contiguousEasternNeighbors(grid)
          expect(neighbors.length).to.equal(1)
          expect(neighbors[0].x).to.eq(0)
          expect(neighbors[0].y).to.eq(0)
          expect(neighbors[0].enabled).to.be.true()
        })
      })
    })

    describe('towards the south', () => {
      context('and some are found', () => {
        it('should include itself in the list of neighbors', () => {
          // 1 1 1
          // 1 0 1
          // 1 1 0
          const grid = new Grid([[1, 1, 1], [1, 0, 1], [1, 1, 0]])
          const sut = grid.findPoint(0, 0)
          const neighbors = sut.contiguousSouthernNeighbors(grid)
          expect(neighbors[0].x).to.eq(0)
          expect(neighbors[0].y).to.eq(0)
          expect(neighbors[0].enabled).to.be.true()
        })

        it('they should be collected as southern neighbors', () => {
          // 1 1 1
          // 1 0 1
          // 1 1 0
          const grid = new Grid([[1, 1, 1], [1, 0, 1], [1, 1, 0]])
          const sut = grid.findPoint(0, 0)
          const neighbors = sut.contiguousSouthernNeighbors(grid)
          expect(neighbors.length).to.equal(3)
          expect(neighbors[0].x).to.eq(0)
          expect(neighbors[0].y).to.eq(0)
          expect(neighbors[0].enabled).to.be.true()

          expect(neighbors[1].x).to.eq(0)
          expect(neighbors[1].y).to.eq(1)
          expect(neighbors[1].enabled).to.be.true()

          expect(neighbors[2].x).to.eq(0)
          expect(neighbors[2].y).to.eq(2)
          expect(neighbors[2].enabled).to.be.true()
        })
      })

      context('and none are found', () => {
        it('should just include itself in the list of neighbors', () => {
          // 1 0 0
          // 0 0 1
          // 0 1 0
          const grid = new Grid([[1, 0, 0], [0, 0, 1], [0, 1, 0]])
          const sut = grid.findPoint(0, 0)
          const neighbors = sut.contiguousSouthernNeighbors(grid)
          expect(neighbors.length).to.equal(1)
          expect(neighbors[0].x).to.eq(0)
          expect(neighbors[0].y).to.eq(0)
          expect(neighbors[0].enabled).to.be.true()
        })
      })
    })
  })
})
