import './test_helper'
import TruCode from '../src/index'
import { MockDrawing } from './mock_drawing'

describe('Packaging TruCode', () => {
  it('should export the TruCode class', () => {
    expect(TruCode).to.not.be.undefined()
  })

  it('should be constructable', () => {
    const sut = new TruCode(new MockDrawing(), [[1]])
    expect(sut).to.not.be.undefined()
  })
})
