import test from 'node:test'
import assert from 'node:assert/strict'
import { TruCodeService } from '../src/tru_code_service.js'

const token = payload => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `header.${encoded}.signature`
}

test('TruCodeService retains endpoint and axios-compatible response shapes', async () => {
  const calls = []
  const client = {
    post: async (url, body) => {
      calls.push({ method: 'POST', url, body })
      return { data: { id: 'one', payload: token({ exp: 2000000000 }) } }
    },
    get: async url => {
      calls.push({ method: 'GET', url })
      return { data: { id: 'one', paired: true } }
    }
  }
  const service = new TruCodeService(
    'https://api.example.test/', 'relying-party', client
  )

  const created = await service.create()
  const fetched = await service.get('one/two')

  assert.equal(created.data.expires_at, 2000000000000)
  assert.equal(fetched.data.paired, true)
  assert.deepEqual(calls, [
    {
      method: 'POST',
      url: 'https://api.example.test/api/v2/trucodes',
      body: { relying_party_id: 'relying-party' }
    },
    {
      method: 'GET',
      url: 'https://api.example.test/api/v2/trucodes/one%2Ftwo'
    }
  ])
})

test('TruCodeService uses native fetch and exposes HTTP failures', async () => {
  const requests = []
  const fetch = async (url, options = {}) => {
    requests.push({ url, options })
    return {
      ok: false,
      status: 403,
      headers: new Map(),
      text: async () => '{"message":"denied"}'
    }
  }
  const service = new TruCodeService(
    'https://api.example.test', 'rp', undefined, fetch
  )

  await assert.rejects(service.create(), error => {
    assert.equal(error.response.status, 403)
    assert.deepEqual(error.response.data, { message: 'denied' })
    return true
  })
  assert.equal(requests[0].options.method, 'POST')
  assert.equal(
    requests[0].options.body,
    JSON.stringify({ relying_party_id: 'rp' })
  )
})

test('TruCodeService validates its public inputs', async () => {
  assert.throws(() => new TruCodeService('', 'rp'), /URL/)
  assert.throws(() => new TruCodeService('https://api.test', ''), /relyingPartyId/)
  const service = new TruCodeService(
    'https://api.test', 'rp', { get: () => {}, post: () => {} }
  )
  await assert.rejects(service.get(''), /ID/)
})
