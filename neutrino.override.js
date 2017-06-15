const { path, pathOr } = require('ramda')
const { join, dirname } = require('path')

module.exports = neutrino => {
  const defaultEntry = join(neutrino.options.source, 'index.js')
  const defaultTsEntry = join(neutrino.options.source, 'index.ts')
  neutrino.options.output = './dist'
  neutrino.config
    .devtool('source-map')
    .output
      .path(neutrino.options.output)
      .library('msCFB')
      .libraryTarget('umd')
      .publicPath('./')
      .filename('ms-cfb.js')
      .chunkFilename('[id].js')
      .end()
    .plugins
      .delete('chunk')
      .delete('named-modules')
      .end()
    .when(process.env.NODE_ENV === 'development', config => {
      const protocol = process.env.HTTPS ? 'https' : 'http'
      const host = process.env.HOST || pathOr('localhost', ['options', 'config', 'devServer', 'host'], neutrino)
      const port = process.env.PORT || pathOr(5000, ['options', 'config', 'devServer', 'port'], neutrino)
      config
        .entry('index')
          .clear()
          .add(neutrino.options.entry === defaultEntry ? defaultTsEntry : neutrino.options.entry)
          .prepend(`webpack-dev-server/client?${protocol}://${host}:${port}/`)
          .end()
    })
}
