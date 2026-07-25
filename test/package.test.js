import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import fs from 'node:fs'

test('build emits ESM, CommonJS, and browser artifacts', async () => {
  const esm = await import('../dist/index.js')
  const require = createRequire(import.meta.url)
  const commonjs = require('../dist/index.cjs')
  const browser = fs.readFileSync(
    new URL('../dist/trucode.js', import.meta.url), 'utf8'
  )

  assert.equal(typeof esm.default.drawTruCode, 'function')
  assert.equal(typeof commonjs.default.drawTruCode, 'function')
  assert.match(browser, /globalThis\.Trusona/)
})
