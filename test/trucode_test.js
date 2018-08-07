import { expect } from "chai"
import  { TruCode }  from "../src/tru_code"

import { MockDrawing } from './mock_drawing'

describe("TruCode", () => {
  let validMatrix, invalidMatrix, drawing, validTruCode
  beforeEach(() => {
    drawing = new MockDrawing()
    validMatrix = [[1, 1], [1, 1]]
    invalidMatrix = [[1, 1], [1, 1], [1]]
    validTruCode = new TruCode(drawing, validMatrix)
  })

  describe("creating a tru code", () => {
    it('requires a drawing that quacks like svg.js', () => {
      expect(() => new TruCode(null, validMatrix)).to.throw()
      expect(() => new TruCode(undefined, validMatrix)).to.throw()
      expect(() => new TruCode(false, validMatrix)).to.throw()
      expect(() => new TruCode(drawing, validMatrix)).to.not.throw()
    })

    it('optionally accepts a non-matrix payload to be encoded', () => {
      const payload = 'taco'
      expect(() => new TruCode(drawing, payload)).to.not.throw()
    })

    context('when a payload is supplied instead of a matrix', () => {
      it('should be turned into a matrix', () => {
        const payload = 'shrimp'
        expect(new TruCode(drawing, payload).matrix).to.be.an('array')
      })
    })

    it("requires a valid matrix", () => {
      expect(() => new TruCode(drawing, invalidMatrix)).to.throw()
      expect(() => new TruCode(drawing, validMatrix)).to.not.throw()
    })

  })

  it("has a canvas context", () => {
    const sut = validTruCode
    expect(sut.context).to.have.property("shapeColors")
    expect(sut.context).to.have.property("dotColor")
    expect(sut.context).to.have.property("containerWidth")
  })

  describe("drawing", () => {
    it("should start with an unpaired beacon", () => {
      const sut = validTruCode
      expect(sut.hasPairedBeacon()).to.be.false
    })

    context('drawing a single dot', () => {
      it('should draw a 1x1 rectangle', () => {
        // 1 0
        // 0 0
        const mock = new MockDrawing()
        const singleDotMatrix = [[1, 0], [0, 0]]

        const sut = new TruCode(mock, singleDotMatrix)
        sut.draw()

        expect(mock.rect.called).to.be.true
        expect(mock.rect.calledWith(1, 1)).to.be.true

        // todo separate test?
        expect(mock.radius.calledWith(0.8)).to.be.true

      })
    })

    context('drawing a single horizontal line', () => {
      it('should draw a line given the dimensions of connected neighbors', () => {
        // 1 1 1
        // 0 0 0
        // 0 0 0
        const mock = new MockDrawing()
        const singleDotMatrix = [[1, 0, 0], [1, 0, 0], [1, 0, 0]]

        const sut = new TruCode(mock, singleDotMatrix)
        sut.draw()

        expect(mock.rect.called).to.be.true
        expect(mock.rect.calledWith(3, 1)).to.be.true
      })
    })

    context('drawing a single veritcal line', () => {
      it('should draw a line given the dimensions of connected neighbors', () => {
        // 1 0 0
        // 1 0 0
        // 1 0 0
        const mock = new MockDrawing()
        const singleDotMatrix = [[1, 1, 1], [0, 0, 0], [0, 0, 0]]

        const sut = new TruCode(mock, singleDotMatrix)
        sut.draw()

        expect(mock.rect.called).to.be.true
        expect(mock.rect.calledWith(1, 3)).to.be.true
      })
    })

    context('drawing a line on an island by itself', () => {
      it('should position the rectangle correctly', () => {
        // 0 0 0 0
        // 0 1 1 0
        // 0 0 0 0
        // 0 0 0 0
        const mock = new MockDrawing()
        const singleDotMatrix = [[0, 0, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]]

        const sut = new TruCode(mock, singleDotMatrix)
        sut.draw()

        expect(mock.rect.called).to.be.true
        expect(mock.rect.calledWith(2, 1)).to.be.true
        expect(mock.attr.calledTwice).to.be.true

        const attrArgs = mock.attr.getCall(1).args[0]
        expect(attrArgs.x).to.equal(1)
        expect(attrArgs.y).to.equal(1)
      })
    })

  })
})