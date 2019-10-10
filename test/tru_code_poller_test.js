import './test_helper'
import MockWindow from './mock_window'
import { TruCodePoller } from '../src/tru_code_poller'

describe('TruCodePoller', () => {
  const trucodeId = 'theonetrucode'

  let mockTrucodeService
  let window

  let sut

  beforeEach(() => {
    mockTrucodeService = {
      create: sinon.stub(),
      get: sinon.stub()
    }
    window = new MockWindow()

    sut = new TruCodePoller(mockTrucodeService, window)
  })

  describe('#constructor', () => {
    it('should default handlers to noop functions', () => {
      expect(sut.payloadHandler).to.be.a('function')
      expect(sut.pairedHandler).to.be.a('function')
      expect(sut.errorHandler).to.be.a('function')
    })

    it('should not be completed', () => {
      expect(sut.completed).to.be.false()
    })

    it('should not have anything polling', () => {
      expect(sut.pollCount).to.equal(0)
    })

    it('should not have any errors', () => {
      expect(sut.errors).to.equal(0)
    })

    it('registers a callback to stop polling when the browser exits', () => {
      expect(window.addEventListener.calledWith(
        'beforeunload',
        sinon.match.func
      )).to.be.true()
    })
  })

  describe('#onPayload', () => {
    it('should register the payloadHandler function', () => {
      const handler = sinon.spy()

      expect(sut.onPayload(handler)).to.equal(sut)
      expect(sut.payloadHandler).to.equal(handler)
    })
  })

  describe('#onPaired', () => {
    it('should register the pairedHandler function', () => {
      const handler = sinon.spy()

      expect(sut.onPaired(handler)).to.equal(sut)
      expect(sut.pairedHandler).to.equal(handler)
    })
  })

  describe('#onError', () => {
    it('should register the errorHandler function', () => {
      const handler = sinon.spy()

      expect(sut.onError(handler)).to.equal(sut)
      expect(sut.errorHandler).to.equal(handler)
    })
  })

  describe('#_getTrucode', () => {
    let trucodeData

    beforeEach(() => {
      sut.onPayload(sinon.spy())
      trucodeData = { id: trucodeId, expires_at: 42 }
      mockTrucodeService.create
        .withArgs()
        .returns(Promise.resolve({ data: trucodeData }))
    })

    it('should create a new trucode', () => {
      return sut._getTrucode().then((result) => {
        expect(result).to.deep.equal(trucodeData)
      })
    })

    it('should call the payload handler with the trucode data', () => {
      return sut._getTrucode().then((id) => {
        expect(sut.payloadHandler.calledWith(trucodeData)).to.be.true()
      })
    })
  })

  describe('#_scheduleNextTrucode', () => {
    let currentTime
    let mockSetTimeout

    beforeEach(() => {
      currentTime = new Date().getTime()
      sinon.useFakeTimers(currentTime)
      mockSetTimeout = sinon.stub()
    })

    it('should return the trucode', () => {
      expect(sut._scheduleNextTrucode({ expires_at: currentTime })).to.deep.equal({ expires_at: currentTime })
    })

    context('with a trucode expiring in 30 seconds', () => {
      it('should schedule the next trucode 10 seconds before it expires', () => {
        sut._scheduleNextTrucode({ expires_at: currentTime + 30000 }, mockSetTimeout)

        expect(mockSetTimeout.calledWith(sinon.match.func, 20000)).to.be.true()
      })
    })

    context('with an already expired trucode', () => {
      it('should schedule the next trucode in 5 seconds', () => {
        sut._scheduleNextTrucode({ expires_at: 0 }, mockSetTimeout)

        expect(mockSetTimeout.calledWith(sinon.match.func, 5000)).to.be.true()
      })
    })
  })

  describe('#_get', () => {
    const trucode = { id: trucodeId }
    const statusData = { id: trucodeId, paired: false }

    it('should call get on the trucodeService with the trucodeId', () => {
      mockTrucodeService.get
        .withArgs(trucodeId)
        .returns(Promise.resolve({ data: statusData }))

      return sut._get(trucode).then((response) => {
        expect(response.data).to.deep.equal(statusData)
      })
    })
  })

  describe('#_handleResponse', () => {
    beforeEach(() => {
      sut.pairedHandler = sinon.stub()
      sut._completed = sinon.stub()
      sut._pollComplete = sinon.stub()
    })

    context('with an unpaired trucode', () => {
      beforeEach(() => {
        sut._handleResponse({ data: { id: trucodeId, paired: false } })
      })

      it('should not call the pairedHandler', () => {
        expect(sut.pairedHandler.called).to.be.false()
      })

      it('should not call _completed', () => {
        expect(sut._completed.called).to.be.false()
      })

      it('should call _pollComplete', () => {
        expect(sut._pollComplete.called).to.be.true()
      })
    })

    context('with a paired trucode', () => {
      beforeEach(() => {
        sut._handleResponse({ data: { id: trucodeId, paired: true } })
      })

      it('should call the pairedHandler', () => {
        expect(sut.pairedHandler.calledWith(trucodeId)).to.be.true()
      })

      it('should call _completed', () => {
        expect(sut._completed.called).to.be.true()
      })

      it('should call _pollComplete', () => {
        expect(sut._pollComplete.called).to.be.true()
      })
    })
  })

  describe('#_handleError', () => {
    beforeEach(() => {
      sut._pollComplete = sinon.stub()
      sut._handleError()
    })

    it('should increment the number of errors', () => {
      expect(sut.errors).to.equal(1)
    })

    it('should call _pollComplete', () => {
      expect(sut._pollComplete.called).to.be.true()
    })
  })

  describe('#_pollComplete', () => {
    beforeEach(() => {
      sut.poll = sinon.stub()
    })

    context('with poll count greater than one', () => {
      beforeEach(() => {
        sut.pollCount = 2
        sut._pollComplete()
      })

      it('should decrement the pollCount', () => {
        expect(sut.pollCount).to.equal(1)
      })

      it('should not start another poller', () => {
        expect(sut.poll.called).to.be.false()
      })
    })

    context('with poll count equal to one', () => {
      it('should start another poller', () => {
        sut.pollCount = 1
        sut._pollComplete()
        expect(sut.poll.called).to.be.true()
      })
    })
  })

  describe('#poll', () => {
    const trucode = { id: trucodeId }
    const response = { data: { id: trucodeId, paired: true } }

    beforeEach(() => {
      sut._getTrucode = sinon.stub()
      sut._scheduleNextTrucode = sinon.stub()
      sut._get = sinon.stub()
      sut._handleResponse = sinon.stub()
      sut._handleError = sinon.stub()
    })

    context('with the poller already completed', () => {
      beforeEach(() => {
        sut.completed = true
        sut.errorHandler = sinon.stub()
        sut._completed = sinon.stub()
      })

      it('should not call the errorHandler', () => {
        return sut.poll().then(() => expect(sut.errorHandler.called).to.be.false())
      })

      it('should not call _completed', () => {
        return sut.poll().then(() => expect(sut._completed.called).to.be.false())
      })

      it('should not call _getTrucode', () => {
        return sut.poll().then(() => expect(sut._getTrucode.called).to.be.false())
      })

      it('should not call _scheduleNextTrucode', () => {
        return sut.poll().then(() => expect(sut._scheduleNextTrucode.called).to.be.false())
      })

      it('should not call _get', () => {
        return sut.poll().then(() => expect(sut._get.called).to.be.false())
      })

      it('should not call _handleResponse', () => {
        return sut.poll().then(() => expect(sut._handleResponse.calledWith(response)).to.be.false())
      })

      it('should not call _handleError', () => {
        return sut.poll().then(() => expect(sut._handleError.called).to.be.false())
      })
    })

    context('with an error count of 5', () => {
      beforeEach(() => {
        sut.errors = 5
        sut.errorHandler = sinon.stub()
        sut._completed = sinon.stub()
      })

      it('should call the errorHandler', () => {
        return sut.poll().then(() => expect(sut.errorHandler.called).to.be.true())
      })

      it('should call _completed', () => {
        return sut.poll().then(() => expect(sut._completed.called).to.be.true())
      })

      it('should not call _getTrucode', () => {
        return sut.poll().then(() => expect(sut._getTrucode.called).to.be.false())
      })

      it('should not call _scheduleNextTrucode', () => {
        return sut.poll().then(() => expect(sut._scheduleNextTrucode.called).to.be.false())
      })

      it('should not call _get', () => {
        return sut.poll().then(() => expect(sut._get.called).to.be.false())
      })

      it('should not call _handleResponse', () => {
        return sut.poll().then(() => expect(sut._handleResponse.calledWith(response)).to.be.false())
      })

      it('should not call _handleError', () => {
        return sut.poll().then(() => expect(sut._handleError.called).to.be.false())
      })
    })

    context('with a poll count less than 2', () => {
      beforeEach(() => {
        sut.pollCount = 0
        sut._getTrucode.returns(Promise.resolve(trucode))
        sut._scheduleNextTrucode.withArgs(trucode).returns(trucode)
        sut._get.withArgs(trucode).returns(Promise.resolve(response))
      })

      it('should increment the pollCount', () => {
        return sut.poll().then(() => expect(sut.pollCount).to.equal(1))
      })

      it('should call _getTrucode', () => {
        return sut.poll().then(() => expect(sut._getTrucode.called).to.be.true())
      })

      it('should call _scheduleNextTrucode', () => {
        return sut.poll().then(() => expect(sut._scheduleNextTrucode.called).to.be.true())
      })

      it('should call _get', () => {
        return sut.poll().then(() => expect(sut._get.called).to.be.true())
      })

      it('should call _handleResponse', () => {
        return sut.poll().then(() => expect(sut._handleResponse.calledWith(response)).to.be.true())
      })

      it('should not call _handleError', () => {
        return sut.poll().then(() => expect(sut._handleError.called).to.be.false())
      })
    })

    context('with a poll count 2 or greater', () => {
      beforeEach(() => {
        sut.pollCount = 2
      })

      it('should not increment the pollCount', () => {
        return sut.poll().then(() => expect(sut.pollCount).to.equal(2))
      })

      it('should not call _getTrucode', () => {
        return sut.poll().then(() => expect(sut._getTrucode.called).to.be.false())
      })

      it('should not call _scheduleNextTrucode', () => {
        return sut.poll().then(() => expect(sut._scheduleNextTrucode.called).to.be.false())
      })

      it('should not call _get', () => {
        return sut.poll().then(() => expect(sut._get.called).to.be.false())
      })

      it('should not call _handleResponse', () => {
        return sut.poll().then(() => expect(sut._handleResponse.calledWith(response)).to.be.false())
      })

      it('should not call _handleError', () => {
        return sut.poll().then(() => expect(sut._handleError.called).to.be.false())
      })
    })

    context('with the call to _getTrucode erroring', () => {
      beforeEach(() => {
        sut._getTrucode.returns(Promise.reject(new Error('I blame Jones')))
      })

      it('should not call _get', () => {
        return sut.poll().then(() => expect(sut._get.called).to.be.false())
      })

      it('should not call _scheduleNextTrucode', () => {
        return sut.poll().then(() => expect(sut._scheduleNextTrucode.called).to.be.false())
      })

      it('should not call _handleResponse', () => {
        return sut.poll().then(() => expect(sut._handleResponse.called).to.be.false())
      })

      it('should call _handleError', () => {
        return sut.poll().then(() => expect(sut._handleError.called).to.be.true())
      })
    })

    context('when the browser exits', () => {
      it('stops polling', () => {
        window.addEventListener.callArg(1)
        return sut.poll().then(() => {
          expect(sut._getTrucode.called).to.be.false()
        })
      })
    })
  })

  describe('#_completed', () => {
    it('should set completed to true', () => {
      sut._completed()
      expect(sut.completed).to.be.true()
    })

    it('should clear payloadHandler', () => {
      const stub = sinon.stub()
      sut.onPayload(stub)
      sut._completed()
      expect(sut.payloadHandler).to.not.equal(stub)
    })

    it('should clear pairedHandler', () => {
      const stub = sinon.stub()
      sut.onPaired(stub)
      sut._completed()
      expect(sut.pairedHandler).to.not.equal(stub)
    })

    it('should clear errorHandler', () => {
      const stub = sinon.stub()
      sut.onError(stub)
      sut._completed()
      expect(sut.errorHandler).to.not.equal(stub)
    })
  })
})
