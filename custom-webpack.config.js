const { merge } = require('webpack-merge');

const nodeExternals = require('webpack-node-externals');

module.exports = (config, context) => {
  return merge(config, {
    externalsPresets: { node: true },
    // externals: [nodeExternals()],
  });
};
