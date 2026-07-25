const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  if (typeof globalThis.atob === 'function') return globalThis.atob(padded)
  return Buffer.from(padded, 'base64').toString('utf8')
}

const expirationFrom = (payload) => {
  try {
    const expiration = Number(JSON.parse(decodeBase64Url(payload.split('.')[1])).exp)
    if (!Number.isFinite(expiration)) return undefined
    return expiration < 1_000_000_000_000 ? expiration * 1000 : expiration
  } catch {
    return undefined
  }
}

class FetchClient {
  constructor (fetchImplementation) {
    this.fetch = fetchImplementation
  }

  post (url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  get (url) {
    return this.request(url)
  }

  async request (url, options = {}) {
    const response = await this.fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    const text = await response.text()
    let data
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = text
    }
    const result = { data, status: response.status, headers: response.headers }
    if (!response.ok) {
      const error = new Error(`TruCode request returned HTTP ${response.status}`)
      error.response = result
      throw error
    }
    return result
  }
}

export class TruCodeService {
  constructor (
    url,
    relyingPartyId,
    restClient,
    fetchImplementation = globalThis.fetch
  ) {
    if (!url) throw new Error('A valid TruCode URL is required.')
    if (!relyingPartyId) throw new Error('A relyingPartyId is required.')
    if (!restClient && typeof fetchImplementation !== 'function') {
      throw new Error('A Fetch implementation is required.')
    }

    this.restClient = restClient || new FetchClient(fetchImplementation)
    this.relyingPartyId = relyingPartyId
    this.baseUrl = `${url.replace(/\/+$/, '')}/api/v2/trucodes`
  }

  create () {
    return this.restClient
      .post(this.baseUrl, { relying_party_id: this.relyingPartyId })
      .then(response => {
        const expiration = expirationFrom(response.data?.payload || '')
        if (expiration !== undefined) response.data.expires_at = expiration
        return response
      })
  }

  get (truCodeId) {
    if (!truCodeId) return Promise.reject(new Error('A TruCode ID is required.'))
    return this.restClient.get(
      `${this.baseUrl}/${encodeURIComponent(truCodeId)}`
    )
  }
}
