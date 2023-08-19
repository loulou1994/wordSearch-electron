const path = require('node:path');
const CopyPlugin = require('copy-webpack-plugin');

const rules = require('./webpack.rules');
const assets = ['assets'];

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  // resolves a path for each assets'element to both dev and prod servers's baseurl: .webpack/renderer/
  plugins: [
    new CopyPlugin({
      patterns: assets.map((asset) => ({
        from: path.resolve(__dirname, 'src', asset),
        to: path.resolve(__dirname, '.webpack/renderer', asset),
      })),
    }),
  ],
};