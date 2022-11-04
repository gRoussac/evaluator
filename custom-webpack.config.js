const { merge } = require('webpack-merge');

//const nodeExternals = require('webpack-node-externals');

module.exports = (config, context) => {
  return merge(config, {
    externalsPresets: { node: true },
    externals: [
      {
        bufferutil: false,
        'utf-8-validate': false,
        sqlite3: 'commonjs sqlite3',
      },
    ],
  });
};
