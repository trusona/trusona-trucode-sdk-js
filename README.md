# TruCode Web SDK

The TruCode Web SDK draws animated, branded TruCodes and can optionally issue
and monitor them through the Trusona API.

Version 2.1 keeps the established browser API while replacing the legacy
Webpack, Babel, Axios, SVG.js, Lodash, and polyfill stack. It uses native
browser networking and SVG animation. The only runtime dependency is the QR
encoder.

## Requirements

- Chrome, Edge, Firefox, or Safari with ES2020 support
- Node.js 20 or newer for development

The renderer honors `prefers-reduced-motion`.

## Installation

```bash
npm install @trusona/trucode
```

ES modules:

```javascript
import Trusona from '@trusona/trucode'
```

CommonJS:

```javascript
const Trusona = require('@trusona/trucode').default
```

The browser bundle is `dist/trucode.js` and exposes `window.Trusona`.

## Draw an existing payload

This is the preferred integration when your application owns TruCode issuance
and status polling:

```html
<div id="tru-code"></div>
```

```javascript
const drawing = Trusona.drawTruCode(
  document.getElementById('tru-code'),
  signedPayload,
  {
    dotColor: '#7B46D1',
    shapeColors: ['#7B46D1', '#5856C2', '#4D4A97'],
    animationConfig: {
      repeatDelay: 7200
    }
  }
)

// Stop active animations before removing the view.
drawing.stop()
```

`drawTruCode(element, payload, config)` retains the 1.x and 2.0 public
signature. It returns a stoppable drawing controller; callers that ignored the
old return value continue to work.

The payload can also be a square matrix containing truthy and falsy module
values.

## Issue and monitor a TruCode

`renderTruCode` retains the original all-in-one interface:

```javascript
const renderer = Trusona.renderTruCode({
  truCodeConfig: {
    truCodeUrl: 'https://api.trusona.net',
    relyingPartyId: '<RELYING_PARTY_ID>',
    qr: {
      dotColor: '#7B46D1',
      shapeColors: ['#7B46D1', '#5856C2', '#4D4A97']
    }
  },
  truCodeElement: document.getElementById('tru-code'),
  onPaired: truCodeId => {
    // Continue the server-owned authentication flow.
  },
  onError: error => {
    // Show a retry state.
  }
})

renderer.stop()
```

The SDK:

1. creates a TruCode at `POST /api/v2/trucodes`;
2. draws its signed payload;
3. polls `GET /api/v2/trucodes/:id`;
4. renews the code before it expires;
5. stops on pairing, explicit `stop()`, `pagehide`, or `beforeunload`.

It limits concurrent requests and stops after five consecutive errors.

## Retained helper APIs

```javascript
Trusona.createTruCode(config, data => {})
Trusona.getTruCode(id, config, paired => {})
```

Both methods still invoke the callback and return a Promise with the
Axios-compatible `{ data, status, headers }` response shape.

## Configuration

| Property | Default | Notes |
| --- | --- | --- |
| `dotColor` | `#7B46D1` | Finder and isolated-module color |
| `shapeColors` | Trusona purple palette | Up to 12 validated hex colors |
| `quietZone` | `3` | Clamped to 2–8 modules |
| `animationConfig.duration` | `520` | Initial assembly duration in ms |
| `animationConfig.delayStep` | `7` | Stagger per SVG mark in ms |
| `animationConfig.maximumDelay` | `420` | Maximum assembly stagger in ms |
| `animationConfig.repeatDelay` | `7200` | Retained and validated for API compatibility |

Legacy `forwardDuration` and `forwardDelayMultiplier` values are accepted as
aliases for `duration` and `delayStep`.

## Development

```bash
npm ci
npm test
npm audit --audit-level=high
npm pack --dry-run
```

`npm test` builds ESM, CommonJS, and browser bundles and runs the compatibility,
renderer, polling, networking, accessibility, reduced-motion, and error-path
tests.
