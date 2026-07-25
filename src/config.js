export const DEFAULT_SHAPE_COLORS = Object.freeze([
  '#7B46D1', '#7B46D1', '#7B46D1', '#5856C2',
  '#4A4CC2', '#5A57B0', '#4D4A97'
])

export const DEFAULT_CONFIG = Object.freeze({
  dotColor: '#7B46D1',
  shapeColors: DEFAULT_SHAPE_COLORS,
  quietZone: 3,
  animationConfig: Object.freeze({
    duration: 520,
    delayStep: 7,
    maximumDelay: 420,
    repeatDelay: 3600
  })
})

const HEX_COLOR = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i

const boundedNumber = (value, fallback, minimum, maximum) => {
  const number = Number(value)
  return Number.isFinite(number)
    ? Math.min(maximum, Math.max(minimum, number))
    : fallback
}

export const normalizeConfig = (value = {}) => {
  const animation = value.animationConfig || {}
  const colors = Array.isArray(value.shapeColors)
    ? value.shapeColors.filter(color => HEX_COLOR.test(String(color))).slice(0, 12)
    : []

  return {
    dotColor: HEX_COLOR.test(String(value.dotColor))
      ? value.dotColor
      : DEFAULT_CONFIG.dotColor,
    shapeColors: colors.length > 0 ? colors : [...DEFAULT_SHAPE_COLORS],
    quietZone: boundedNumber(value.quietZone, DEFAULT_CONFIG.quietZone, 2, 8),
    animationConfig: {
      duration: boundedNumber(
        animation.duration ?? animation.forwardDuration,
        DEFAULT_CONFIG.animationConfig.duration, 0, 5000
      ),
      delayStep: boundedNumber(
        animation.delayStep ?? animation.forwardDelayMultiplier,
        DEFAULT_CONFIG.animationConfig.delayStep, 0, 100
      ),
      maximumDelay: boundedNumber(
        animation.maximumDelay,
        DEFAULT_CONFIG.animationConfig.maximumDelay, 0, 5000
      ),
      repeatDelay: boundedNumber(
        animation.repeatDelay,
        DEFAULT_CONFIG.animationConfig.repeatDelay, 2000, 60000
      )
    }
  }
}
