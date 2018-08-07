import sinon from 'sinon'

class MockAxios {
  constructor() {
    this.get  = sinon.stub()
    this.post = sinon.stub()
  }
}

export default MockAxios