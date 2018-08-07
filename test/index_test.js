import { expect } from 'chai'
import TruCode  from '../src/index'
import { MockDrawing } from './mock_drawing'


describe('Packaging TruCode', () => {
  let win, el

  beforeEach(() => {
    win = require('svgdom')
    el = win.document.documentElement
  })

  it('should export the TruCode class', () => {
    expect(TruCode).to.not.be.undefined
  })

  it('should be constructable', () => {
    const sut = new TruCode(new MockDrawing(), [[1]])
  })

})