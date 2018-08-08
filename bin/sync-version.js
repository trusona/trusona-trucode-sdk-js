const replace = require('replace-in-file')
const git = require('simple-git')()

const packageJson = require('../package.json')

const options = {
  files: ['README.md', 'examples/*.html'],
  from: /trucode-[0-9]+\.[0-9]+\.[0-9]+/g,
  to: `trucode-${packageJson.version}`
}

replace(options)
  .then(changes => {
    console.log(`Sync'd versions in: ${changes.join(', ')}`)
    git.add(changes)
  })
  .catch(error => {
    console.error('Error occurred:', error)
  })