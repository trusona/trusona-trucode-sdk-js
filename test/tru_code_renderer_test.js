import './test_helper'
import { TruCodeRenderer } from '../src/tru_code_renderer'

describe('TruCodeRenderer', () => {
  let validProperties
  let mockPoller

  beforeEach(() => {
    validProperties = {
      truCodeConfig: {
        truCodeUrl: 'https://example.com',
        relyingPartyId: 'B6DE32AF-8625-4F7F-B8B8-AD053A90C337'
      },
      truCodeElement: sinon.stub(),
      onPaired: () => sinon.stub(),
      onError: () => sinon.stub(),
      onPayload: () => sinon.stub()
    }

    mockPoller = {
      poll: sinon.stub(),
      onError: sinon.stub().returnsThis(),
      onPayload: sinon.stub().returnsThis(),
      onPaired: sinon.stub().returnsThis()
    }
  })

  describe('#constructor', () => {
    it('accepts an empty configuration object', () => {
      validProperties.truCodeConfig.qr = {}
      expect(() => new TruCodeRenderer(validProperties)).to.not.throw()
    })

    context('when the configuration is empty', () => {
      xit('uses sensible defaults', () => {

      })
    })

    it('should not throw an error if all properties are valid', () => {
      expect(() => new TruCodeRenderer(validProperties)).to.not.throw()
    })

    it('requires a truCodeConfig object', () => {
      [null, undefined, ''].forEach((truCodeConfig) => {
        expect(() => new TruCodeRenderer(Object.assign(validProperties, { truCodeConfig: truCodeConfig }))).to.throw('truCodeConfig')
      })
    })

    it('requires a trucode element', () => {
      expect(() =>
        new TruCodeRenderer(Object.assign(validProperties, { truCodeElement: null }))
      ).to.throw()

      expect(() =>
        new TruCodeRenderer(Object.assign(validProperties, { truCodeElement: undefined }))
      ).to.throw()

      expect(() =>
        new TruCodeRenderer(Object.assign(validProperties, { truCodeElement: '' }))
      ).to.throw()
    })

    it('requires a trucode host, returned from the trucode sdk to not be null', () => {
      validProperties.truCodeConfig.truCodeUrl = null
      expect(() =>
        new TruCodeRenderer(validProperties)
      ).to.throw()
    })

    it('requires a trucode host, returned from the trucode sdk to not be undefined', () => {
      validProperties.truCodeConfig.truCodeUrl = undefined
      expect(() =>
        new TruCodeRenderer(validProperties)
      ).to.throw()
    })

    it('requires an onPaired handler', () => {
      expect(() =>
        new TruCodeRenderer(Object.assign(validProperties, { onPaired: undefined }))
      ).to.throw()

      expect(() =>
        new TruCodeRenderer(Object.assign(validProperties, { onPaired: null }))
      ).to.throw()
    })

    it('requires an onError handler', () => {
      expect(() =>
        new TruCodeRenderer(Object.assign(validProperties, { onError: undefined }))
      ).to.throw()

      expect(() =>
        new TruCodeRenderer(Object.assign(validProperties, { onError: null }))
      ).to.throw()
    })

    it('requires a relyingPartyId', () => {
      [null, undefined, ''].forEach((relyingPartyId) => {
        validProperties.truCodeConfig.relyingPartyId = relyingPartyId
        expect(() =>
          new TruCodeRenderer(validProperties)
        ).to.throw()
      })
    })

    context('when no poller is specified', () => {
      it('uses a default poller', () => {
        const sut = new TruCodeRenderer(validProperties)
        expect(sut.poller).to.not.be.undefined()
      })

      xit('uses the service to create the default poller', () => {

      })
    })

    it('sets the error callback on the poller to the one specified in the properties', () => {
      const sut = new TruCodeRenderer(Object.assign(validProperties, { poller: mockPoller }))
      expect(sut.poller.onError.calledWith(validProperties.onError)).to.be.true()
    })

    it('sets the payload callback on the poller to the one specified in the properties', () => {
      const sut = new TruCodeRenderer(Object.assign(validProperties, { poller: mockPoller }))
      expect(sut.poller.onPayload.called).to.be.true()
    })

    it('sets the paired callback on the poller to the one specified in the properties', () => {
      const sut = new TruCodeRenderer(Object.assign(validProperties, { poller: mockPoller }))
      expect(sut.poller.onPaired.calledWith(validProperties.onPaired)).to.be.true()
    })
  })

  it('tells the poller to poll for tru code changes', () => {
    const sut = new TruCodeRenderer(Object.assign(validProperties, { poller: mockPoller }))

    sut.render()

    expect(mockPoller.poll.called).to.be.true()
  })

  xit('tells the trucode drawing engine to draw the trucode payload', () => {

  })

  context('when the trucode is paired', () => {
    xit('executes the supplied pairing handler', () => {

    })
  })

  context('when the trucode has an error', () => {
    xit('executes the supplied error handler', () => {

    })
  })
})
