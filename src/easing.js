export class Easing{
  static bounce(pos) {
    var s = 7.5625,
      p = 2.75,
      l

    if (pos < (1 / p)) {
      l = s * pos * pos
    } else {
      if (pos < (2 / p)) {
        pos -= (1.5 / p)
        l = s * pos * pos + .75
      } else {
        if (pos < (2.5 / p)) {
          pos -= (2.25 / p)
          l = s * pos * pos + .9375
        } else {
          pos -= (2.625 / p)
          l = s * pos * pos + .984375
        }
      }
    }
    return l
  }
}