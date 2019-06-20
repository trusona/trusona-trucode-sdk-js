const path = require('path');
const packageJson = require('./package.json')

module.exports = {
  entry: './src/index.js',
  devServer: {
    contentBase: './dist'
  },
  output: {
    filename: `trucode-${packageJson.version}.js`,
    path: path.resolve(__dirname, 'dist'),
    library: 'Trusona',
    libraryTarget: 'var',
    libraryExport: 'default'
  },
  mode: 'production',
  node: {
    fs: 'empty'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: 'babel-loader'
    }]
  }
};