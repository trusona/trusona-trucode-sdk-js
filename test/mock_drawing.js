import sinon from 'sinon'

export class MockDrawing {

  constructor() {
    this.group    = sinon.stub().returnsThis()
    this.viewbox  = sinon.stub().returnsThis()
    this.rect     = sinon.stub().returnsThis()
    this.attr     = sinon.stub().returnsThis()
    this.radius   = sinon.stub().returnsThis()
    this.select   = sinon.stub().returnsThis()
    this.each     = sinon.stub().returnsThis()
  }

}