import { expect } from 'chai'
import sinon from 'sinon'
import { TruCodeService } from '../src/tru_code_service'
import MockAxios from './mock_axios'

describe('TruCodeService', () => {
  const host = 'https://more.tacos.com'
  const relyingPartyId = 'the-rp-id'
  let mockAxios
  let sut

  beforeEach(() => {
    mockAxios = new MockAxios()
    sut       = new TruCodeService(host, relyingPartyId, mockAxios)
  })

  describe('#constructor', () => {
    it('should append the trucodes path to the url', () => {
      const service = new TruCodeService('https://way.more.tacos')
      expect(service.baseUrl).to.equal('https://way.more.tacos/api/v2/trucodes')
    })

    it('should remove trailing / if present', () => {
      const service = new TruCodeService('https://way.more.tacos/')
      expect(service.baseUrl).to.equal('https://way.more.tacos/api/v2/trucodes')
    })
  })

  describe('#create', () => {
    it('should POST to the beacon service endpoint', () => {
      const request = { relying_party_id: 'the-rp-id' }
      const respond = { data: {} }
      mockAxios.post.withArgs('https://more.tacos.com/api/v2/trucodes', request)
        .returns(Promise.resolve(respond))

      return sut.create().then((response) => { expect(response).to.deep.equal(respond)})
    })

    it('should set expires_at based on payload', () => {
      const request = { relying_party_id: 'the-rp-id' }
      const respond = { data: { payload: 'eyJhbGciOiJIUzI1NiJ9.eyJyZXMiOiJ0cnUtY2x1Yi1zdGFnaW5nLmhlcm9rdWFwcC5jb20iLCJsdmwiOjEsImFjdCI6ImxvZ2luIiwicmVnIjoic2luZ2xlIiwicnBpIjoiNDc0YTIzMTgtZjEzOS00ZmIyLWJhODUtOGJmZDQxMzczNzVlIiwiYmlkIjoiZDE4YTQyMDctODRkOS00ODIwLTkwMTEtNjM4ZDIwYzRjZjhlIiwiZXhwIjoxNTA4Mjc2OTEzMDg3LCJyaWQiOiJlZjY1NDNiZS1hYTljLTQwZjMtYmVmNi02MDc4MWU1YWJjNDgifQ.ElSnSRvJoGyWwjIzV80P0zvUp0FaafI5Cr1X54SanUk' } }
      mockAxios.post
        .withArgs('https://more.tacos.com/api/v2/trucodes', request)
        .returns(Promise.resolve(respond))

      return sut.create().then((response) => expect(response.data.expires_at).to.equal(1508276913087))
    })

  })

  describe('#get', () => {
    it('should GET from the beacons service status endpoint', () => {
      const trucodeId = 'abc123'
      const respond  = { data: { id: trucodeId, paired: false }}
      mockAxios.get
        .withArgs('https://more.tacos.com/api/v2/trucodes/abc123')
        .returns(Promise.resolve(respond))

      return sut.get(trucodeId).then((response) => { expect(response).to.deep.equal(respond) })
    })
  })
})