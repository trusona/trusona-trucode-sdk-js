import test from 'node:test'
import assert from 'node:assert/strict'
import { drawTruCode } from '../src/svg_renderer.js'
import { FakeDocument, descendants } from './support/fake_dom.js'

test('drawTruCode renders an accessible animated SVG from a payload', () => {
  const document = new FakeDocument()
  const container = document.createContainer()
  const result = drawTruCode(container, 'modern-trucode')
  const svg = container.children[0]
  const marks = descendants(svg).filter(node =>
    node.getAttribute('class')?.includes('tru-code-drawing')
  )

  assert.equal(svg.nodeName, 'svg')
  assert.equal(svg.getAttribute('role'), 'img')
  assert.equal(svg.getAttribute('aria-label'), 'Trusona sign-in QR code')
  assert.ok(result.matrix.length >= 21)
  assert.equal(result.matrix.length, result.matrix[0].length)
  assert.ok(marks.length > 100)
  assert.ok(marks.some(mark => Number(mark.getAttribute('width')) > 1))
  assert.ok(marks.some(mark => mark.animations.length === 1))
  assert.ok(marks.some(mark => mark.animations.some(animation =>
    animation.options.iterations === Infinity
  )))
})

test('drawTruCode preserves customer colors and finder geometry', () => {
  const document = new FakeDocument()
  const container = document.createContainer()
  drawTruCode(container, 'customer-brand', {
    dotColor: '#123456',
    shapeColors: ['#ABCDEF']
  })
  const marks = descendants(container.children[0]).filter(node =>
    node.getAttribute('class')?.includes('tru-code-drawing')
  )
  const finder = marks.filter(mark =>
    mark.getAttribute('class').includes('tru-code-finder')
  )

  assert.ok(finder.length > 0)
  assert.ok(finder.every(mark => mark.getAttribute('fill') === '#123456'))
  assert.ok(marks.every(mark => mark.getAttribute('rx') === '0.24'))
  assert.ok(marks.some(mark => mark.getAttribute('fill') === '#ABCDEF'))
})

test('drawTruCode disables animation for reduced-motion clients', () => {
  const document = new FakeDocument({ reducedMotion: true })
  const container = document.createContainer()
  drawTruCode(container, 'reduced-motion')
  const marks = descendants(container.children[0]).filter(node =>
    node.getAttribute('class')?.includes('tru-code-drawing')
  )

  assert.ok(marks.every(mark => mark.animations.length === 0))
})

test('redrawing cancels animations owned by the prior drawing', () => {
  const document = new FakeDocument()
  const container = document.createContainer()
  const first = drawTruCode(container, 'first-payload')
  const animations = descendants(first.element)
    .flatMap(mark => mark.animations)

  drawTruCode(container, 'replacement-payload')

  assert.ok(animations.length > 0)
  assert.ok(animations.every(animation => animation.cancelled))
})

test('drawTruCode repeats animation and stop cancels its timer', () => {
  const document = new FakeDocument()
  const timers = new Map()
  let nextTimer = 1
  document.defaultView.setTimeout = (callback, delay) => {
    const id = nextTimer++
    timers.set(id, { callback, delay })
    return id
  }
  document.defaultView.clearTimeout = id => timers.delete(id)
  const container = document.createContainer()
  const result = drawTruCode(container, 'repeat-animation', {
    animationConfig: { repeatDelay: 2400 }
  })

  const [timerId, timer] = timers.entries().next().value
  assert.equal(timer.delay, 2400)
  const before = descendants(result.element)
    .flatMap(mark => mark.animations).length
  timers.delete(timerId)
  timer.callback()
  const after = descendants(result.element)
    .flatMap(mark => mark.animations).length
  const shimmerAnimations = descendants(result.element)
    .flatMap(mark => mark.animations)
    .filter(animation => animation.keyframes.some(frame => frame.filter))
  assert.ok(after > before)
  assert.ok(shimmerAnimations.length > 0)
  assert.ok(shimmerAnimations.every(animation =>
    animation.keyframes.some(frame => frame.transform?.includes('scale(1.16)'))
  ))
  assert.equal([...timers.values()][0].delay, 2400)

  result.stop()
  assert.equal(timers.size, 0)
})

test('drawTruCode accepts the retained matrix input and rejects invalid input', () => {
  const document = new FakeDocument()
  const container = document.createContainer()
  const result = drawTruCode(container, [[1, 0], [0, 1]])

  assert.deepEqual(result.matrix, [[1, 0], [0, 1]])
  assert.throws(() => drawTruCode(container, ''), /non-empty/)
  assert.throws(() => drawTruCode(container, [[1], [1, 0]]), /square/)
  assert.throws(() => drawTruCode({}, 'payload'), /DOM element/)
})
