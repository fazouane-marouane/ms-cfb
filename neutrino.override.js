module.exports = neutrino => {
  neutrino.options.output = './dist'
  neutrino.config
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
}
