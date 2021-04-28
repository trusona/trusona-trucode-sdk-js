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
    const changedFilenames = changes.map((change) => change.file)
    console.log(`Sync'd versions in: ${changedFilenames.join(', ')}`)
    git.add(changedFilenames)
  })
  .catch(error => {
    console.error('Error occurred:', error)
  })
