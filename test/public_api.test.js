import test from 'node:test'
import assert from 'node:assert/strict'
import Trusona, {
  TruCode,
  TruCodeRenderer,
  TruCodeService,
  drawTruCode
} from '../src/index.js'
import { FakeDocument } from './support/fake_dom.js'

test('retains the documented public API', () => {
  assert.equal(typeof Trusona.renderTruCode, 'function')
  assert.equal(typeof Trusona.getTruCode, 'function')
  assert.equal(typeof Trusona.createTruCode, 'function')
  assert.equal(typeof Trusona.drawTruCode, 'function')
  assert.equal(typeof TruCode, 'function')
  assert.equal(typeof TruCodeRenderer, 'function')
  assert.equal(typeof TruCodeService, 'function')
  assert.equal(typeof drawTruCode, 'function')
})

test('drawTruCode keeps the legacy arguments and returns a stoppable drawing', () => {
  const document = new FakeDocument()
  const element = document.createContainer()
  const drawing = Trusona.drawTruCode(element, 'public-api', {
    dotColor: '#112233'
  })

  assert.equal(element.children[0].getAttribute('class'), 'tru-code')
  assert.equal(typeof drawing.stop, 'function')
})

test('createTruCode and getTruCode retain callback and promise behavior', async () => {
  const original = Trusona._service
  const calls = []
  Trusona._service = () => ({
    create: async () => ({ data: { id: 'created' } }),
    get: async () => ({ data: { paired: true } })
  })
  try {
    const created = await Trusona.createTruCode({}, data => calls.push(data.id))
    const fetched = await Trusona.getTruCode('created', {}, paired =>
      calls.push(paired)
    )

    assert.equal(created.data.id, 'created')
    assert.equal(fetched.data.paired, true)
    assert.deepEqual(calls, ['created', true])
  } finally {
    Trusona._service = original
  }
})

test('TruCodeRenderer validates the retained renderTruCode contract', () => {
  const document = new FakeDocument()
  const element = document.createContainer()
  const base = {
    truCodeConfig: {
      truCodeUrl: 'https://api.example.test',
      relyingPartyId: 'rp'
    },
    truCodeElement: element,
    onPaired: () => {},
    onError: () => {},
    poller: {
      onError () { return this },
      onPaired () { return this },
      onPayload () { return this },
      poll () {},
      stop () {}
    }
  }

  assert.doesNotThrow(() => new TruCodeRenderer(base))
  assert.throws(
    () => new TruCodeRenderer({ ...base, truCodeConfig: undefined }),
    /truCodeConfig/
  )
  assert.throws(
    () => new TruCodeRenderer({ ...base, onPaired: undefined }),
    /onPaired/
  )
  assert.throws(
    () => new TruCodeRenderer({ ...base, onError: undefined }),
    /onError/
  )
})
