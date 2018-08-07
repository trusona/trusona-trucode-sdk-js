import fs from 'fs'
import del from 'del'
import {rollup} from 'rollup'
import babel from 'rollup-plugin-babel'
import builtins from 'rollup-plugin-node-builtins'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import babelrc from 'babelrc-rollup'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'

const packageJson = require('../package.json')

let promise = Promise.resolve()

// Clean up the output directory
promise = promise.then(() => del(['dist/*']))

// Compile source code into a distributable format with Babel
promise = promise.then(() => rollup({
  input: 'src/index.js',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' ),
      'global.TYPED_ARRAY_SUPPORT': 'undefined',
      'this.SVG = ': ''
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    builtins(),
    commonjs(),
    babel(babelrc()),
    uglify()
  ]
})).then(bundle => {
  bundle.write({
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: false
  })

  return bundle.write({
    file: `dist/trucode-${packageJson.version}.js`,
    format: 'iife',
    sourcemap: false,
    name: 'Trusona'
  })
})

promise.catch(err => {
  console.error(err.stack)
  process.exit(1)
})
