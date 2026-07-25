import test from 'node:test'
import assert from 'node:assert/strict'
import { TruCodePoller } from '../src/tru_code_poller.js'
import { FakeView } from './support/fake_dom.js'

const flush = () => new Promise(resolve => setImmediate(resolve))

test('poller issues, reports payload, and completes after pairing', async () => {
  const view = new FakeView()
  const service = {
    create: async () => ({
      data: {
        id: 'code-one',
        payload: 'payload',
        expires_at: Date.now() + 60_000
      }
    }),
    get: async () => ({ data: { id: 'code-one', paired: true } })
  }
  const payloads = []
  const paired = []
  const poller = new TruCodePoller(service, view)
    .onPayload(value => payloads.push(value))
    .onPaired(id => paired.push(id))

  await poller.poll()
  view.runTimerWithDelay(0)
  await flush()

  assert.equal(payloads[0].payload, 'payload')
  assert.deepEqual(paired, ['code-one'])
  assert.equal(poller.completed, true)
  assert.equal(view.timers.size, 0)
  assert.equal(view.listeners.size, 0)
})

test('poller renews before expiry without overlapping issue calls', async () => {
  const view = new FakeView()
  let issued = 0
  const service = {
    create: async () => ({
      data: {
        id: `code-${++issued}`,
        payload: 'payload',
        expires_at: Date.now() + 11_000
      }
    }),
    get: async id => ({ data: { id, paired: false } })
  }
  const poller = new TruCodePoller(service, view)
  await poller.poll()
  const renewal = [...view.timers.values()].find(timer => timer.delay === 5000)

  assert.ok(renewal)
  renewal.callback()
  await flush()
  assert.equal(issued, 2)
  poller.stop()
})

test('poller reports the fifth consecutive failure and stops', async () => {
  const view = new FakeView()
  const failure = new Error('network unavailable')
  const errors = []
  const service = {
    create: async () => { throw failure },
    get: async () => ({ data: {} })
  }
  const poller = new TruCodePoller(service, view).onError(
    error => errors.push(error)
  )

  for (let count = 0; count < 5; count += 1) {
    poller.running = false
    await poller.poll()
  }

  assert.deepEqual(errors, [failure])
  assert.equal(poller.completed, true)
})

test('pagehide stops polling and releases timers and handlers', async () => {
  const view = new FakeView()
  const service = {
    create: async () => ({
      data: {
        id: 'code',
        payload: 'payload',
        expires_at: Date.now() + 60_000
      }
    }),
    get: async () => ({ data: { paired: false } })
  }
  const poller = new TruCodePoller(service, view)
  await poller.poll()
  view.listeners.get('pagehide')()

  assert.equal(poller.completed, true)
  assert.equal(view.timers.size, 0)
  assert.equal(view.listeners.size, 0)
})
