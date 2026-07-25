import { build } from 'esbuild'

const shared = {
  entryPoints: ['src/index.js'],
  bundle: true,
  sourcemap: true,
  target: ['es2020'],
  legalComments: 'external'
}

await Promise.all([
  build({
    ...shared,
    format: 'esm',
    outfile: 'dist/index.js'
  }),
  build({
    ...shared,
    format: 'cjs',
    outfile: 'dist/index.cjs'
  }),
  build({
    ...shared,
    format: 'iife',
    globalName: 'Trusona',
    outfile: 'dist/trucode.js',
    footer: {
      js: 'globalThis.Trusona = Trusona.default || Trusona;'
    }
  })
])
