import axios from 'axios'
import { Base64 } from 'js-base64'

export class TruCodeService {
  constructor (url, relyingPartyId, restClient = axios) {
    this.restClient = restClient
    this.relyingPartyId = relyingPartyId
    this.baseUrl = `${url.replace(/\/$/, '')}/api/v2/trucodes`
  }

  create () {
    return this.restClient.post(this.baseUrl, { relying_party_id: this.relyingPartyId })
      .then((response) => {
        const payload = response.data.payload
        if (payload) {
          response.data.expires_at = JSON.parse(Base64.atob(payload.split('.')[1])).exp
        }
        return response
      })
  }

  get (truCodeId) {
    const url = `${this.baseUrl}/${truCodeId}`
    return this.restClient.get(url)
  }
}
