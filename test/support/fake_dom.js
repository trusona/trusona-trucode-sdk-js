export class FakeAnimation {
  constructor (keyframes, options) {
    this.keyframes = keyframes
    this.options = options
    this.cancelled = false
  }

  cancel () {
    this.cancelled = true
  }
}

export class FakeElement {
  constructor (name, document) {
    this.nodeName = name
    this.ownerDocument = document
    this.attributes = new Map()
    this.children = []
    this.animations = []
  }

  setAttribute (name, value) {
    this.attributes.set(name, String(value))
  }

  getAttribute (name) {
    return this.attributes.get(name) ?? null
  }

  appendChild (child) {
    this.children.push(child)
    return child
  }

  replaceChildren (...children) {
    this.children = children
  }

  animate (keyframes, options) {
    const animation = new FakeAnimation(keyframes, options)
    this.animations.push(animation)
    return animation
  }
}

export class FakeDocument {
  constructor ({ reducedMotion = false } = {}) {
    this.defaultView = {
      matchMedia: () => ({ matches: reducedMotion })
    }
  }

  createElementNS (_namespace, name) {
    return new FakeElement(name, this)
  }

  createContainer () {
    return new FakeElement('div', this)
  }
}

export const descendants = (element) => (
  element.children.flatMap(child => [child, ...descendants(child)])
)

export class FakeView {
  constructor () {
    this.listeners = new Map()
    this.timers = new Map()
    this.nextTimer = 1
  }

  addEventListener (name, callback) {
    this.listeners.set(name, callback)
  }

  removeEventListener (name, callback) {
    if (this.listeners.get(name) === callback) this.listeners.delete(name)
  }

  setTimeout = (callback, delay) => {
    const id = this.nextTimer++
    this.timers.set(id, { callback, delay })
    return id
  }

  clearTimeout = id => {
    this.timers.delete(id)
  }

  runNextTimer () {
    const entry = this.timers.entries().next().value
    if (!entry) return false
    const [id, timer] = entry
    this.timers.delete(id)
    timer.callback()
    return true
  }

  runTimerWithDelay (delay) {
    const entry = [...this.timers.entries()].find(([, timer]) =>
      timer.delay === delay
    )
    if (!entry) return false
    const [id, timer] = entry
    this.timers.delete(id)
    timer.callback()
    return true
  }
}
