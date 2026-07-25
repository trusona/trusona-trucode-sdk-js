import { normalizeConfig } from './config.js'
import { matrixFor } from './matrix.js'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const activeDrawings = new WeakMap()
const CORNER_RADIUS = 0.24

const finderModule = (x, y, size) => (
  (x < 7 && y < 7) ||
  (x >= size - 7 && y < 7) ||
  (x < 7 && y >= size - 7)
)

const createMark = (document, { x, y, width, color, square }) => {
  const mark = document.createElementNS(SVG_NAMESPACE, 'rect')
  mark.setAttribute('x', x)
  mark.setAttribute('y', y)
  mark.setAttribute('width', width)
  mark.setAttribute('height', 1)
  mark.setAttribute('rx', CORNER_RADIUS)
  mark.setAttribute('fill', color)
  mark.setAttribute('class', square
    ? 'tru-code-finder tru-code-drawing'
    : 'tru-code-shape tru-code-drawing')
  return mark
}

const prefersReducedMotion = (view) => (
  view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
)

const animateMarks = (marks, config, view, rawColors) => {
  if (prefersReducedMotion(view)) return { stop: () => {} }

  const animations = []
  const colorAnimations = []
  let shimmerAnimations = []
  let repeatTimer
  let stopped = false
  const palette = [...new Set(rawColors)]

  const animateAssembly = () => {
    marks.forEach((mark, index) => {
      if (typeof mark.animate !== 'function') return
      animations.push(mark.animate([
        { opacity: 0, transform: 'translateY(0.9px) scale(0.25)' },
        { opacity: 1, transform: 'translateY(-0.12px) scale(1.06)', offset: 0.7 },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], {
        duration: config.duration,
        delay: (index * config.delayStep) % config.maximumDelay,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      }))
    })
  }

  const animateColorDrift = () => {
    marks
      .filter(mark =>
        mark.getAttribute('class')?.includes('tru-code-shape') &&
        typeof mark.animate === 'function'
      )
      .forEach(mark => {
        const x = Number(mark.getAttribute('x'))
        const y = Number(mark.getAttribute('y'))
        const offset = (x + y) % palette.length
        const colors = [
          ...palette.slice(offset),
          ...palette.slice(0, offset)
        ]
        if ((x + y) % 2 !== 0) colors.reverse()
        colors.push(colors[0])
        colorAnimations.push(mark.animate(
          colors.map(fill => ({ fill })),
          {
          duration: 2600 + (((x * 17) + (y * 29)) % 1400),
          delay: -(((x * 31) + (y * 13)) % 3000),
          easing: 'ease-in-out',
          iterations: Infinity
          }
        ))
      })
  }

  const animatePulse = () => {
    shimmerAnimations.forEach(animation => animation.cancel())
    shimmerAnimations = []
    const shapes = marks.filter(mark =>
      mark.getAttribute('class')?.includes('tru-code-shape')
    )
    const maximumDiagonal = Math.max(...shapes.map(mark =>
      Number(mark.getAttribute('x')) + Number(mark.getAttribute('y'))
    ))

    shapes.forEach(mark => {
      if (typeof mark.animate !== 'function') return
      const diagonal = (
        Number(mark.getAttribute('x')) + Number(mark.getAttribute('y'))
      )
      shimmerAnimations.push(mark.animate([
        {
          filter: 'brightness(1) drop-shadow(0 0 0 transparent)',
          transform: 'translateY(0) scale(1)'
        },
        {
          filter: 'brightness(1.65) saturate(1.12) drop-shadow(0 0.22px 0.18px rgb(37 16 79 / 35%))',
          transform: 'translateY(-0.2px) scale(1.16)',
          offset: 0.5
        },
        {
          filter: 'brightness(1) drop-shadow(0 0 0 transparent)',
          transform: 'translateY(0) scale(1)'
        }
      ], {
        duration: Math.max(config.duration, 900),
        delay: maximumDiagonal === 0
          ? 0
          : (diagonal / maximumDiagonal) * config.maximumDelay,
        easing: 'cubic-bezier(0.37, 0, 0.63, 1)'
      }))
    })
  }

  const scheduleRepeat = () => {
    if (stopped || typeof view?.setTimeout !== 'function') return
    repeatTimer = view.setTimeout(() => {
      if (stopped) return
      animatePulse()
      scheduleRepeat()
    }, config.repeatDelay)
  }

  animateAssembly()
  animateColorDrift()
  scheduleRepeat()

  return {
    stop: () => {
      stopped = true
      if (repeatTimer !== undefined) view?.clearTimeout?.(repeatTimer)
      animations.forEach(animation => animation.cancel())
      colorAnimations.forEach(animation => animation.cancel())
      shimmerAnimations.forEach(animation => animation.cancel())
    }
  }
}

export const drawTruCode = (element, payload, rawConfig = {}) => {
  if (!element || typeof element.replaceChildren !== 'function') {
    throw new Error('A DOM element for TruCode drawing is required.')
  }

  activeDrawings.get(element)?.stop()
  const matrix = matrixFor(payload)
  const config = normalizeConfig(rawConfig)
  const size = matrix.length
  const document = element.ownerDocument || globalThis.document
  if (!document?.createElementNS) {
    throw new Error('A document with SVG support is required.')
  }

  const svg = document.createElementNS(SVG_NAMESPACE, 'svg')
  svg.setAttribute(
    'viewBox',
    `${-config.quietZone} ${-config.quietZone} ` +
      `${size + (config.quietZone * 2)} ${size + (config.quietZone * 2)}`
  )
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', 'Trusona sign-in QR code')
  svg.setAttribute('class', 'tru-code')
  svg.setAttribute('shape-rendering', 'geometricPrecision')

  const drawing = document.createElementNS(SVG_NAMESPACE, 'g')
  drawing.setAttribute('id', 'qr-code')
  const marks = []

  matrix.forEach((row, y) => {
    let x = 0
    while (x < size) {
      if (row[x] !== 1) {
        x += 1
        continue
      }

      const square = finderModule(x, y, size)
      const start = x
      if (!square) {
        while (
          x + 1 < size &&
          row[x + 1] === 1 &&
          !finderModule(x + 1, y, size)
        ) x += 1
      }

      const width = x - start + 1
      const color = square || width === 1
        ? config.dotColor
        : config.shapeColors[(start + (y * 3)) % config.shapeColors.length]
      const mark = createMark(document, {
        x: start, y, width, color, square
      })
      drawing.appendChild(mark)
      marks.push(mark)
      x += 1
    }
  })

  svg.appendChild(drawing)
  element.replaceChildren(svg)
  const animation = animateMarks(
    marks,
    config.animationConfig,
    document.defaultView || globalThis.window,
    [config.dotColor, ...config.shapeColors]
  )
  const result = {
    element: svg,
    matrix,
    stop: animation.stop
  }
  activeDrawings.set(element, result)
  return result
}
