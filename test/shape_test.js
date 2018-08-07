import { expect } from 'chai'
import { Shape } from '../src/shape'
import { MockDrawing } from './mock_drawing'

describe('Shape', () => {
  describe('creating a new Shape', () => {
    it('requires points', () => {
      expect(() => new Shape()).to.throw
      expect(() => new Shape(undefined)).to.throw
      expect(() => new Shape(null)).to.throw
      expect(() => new Shape(false)).to.throw
      expect(() => new Shape([{}])).to.not.throw
    })
  })

  describe('drawing squares', () => {
    it('should draw squares', () => {
      const points = [{ x: 0, y: 0, enabled: true }]
      const sut = new Shape(points)
      sut.drawSquare(new MockDrawing(), "#F00", 3)
    })
  })

  describe('drawing shapes', () => {
    it('it should draw shapes', () => {
      const points = [{ x: 0, y: 0, enabled: true }]
      const sut = new Shape(points)
      sut.draw(new MockDrawing(), ["#F00"])
    })
  })
})