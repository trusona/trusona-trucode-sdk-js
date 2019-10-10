import sinon from 'sinon'

class MockWindow {
  constructor () {
    this.addEventListener = sinon.stub()
  }
}

export default MockWindow