const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/background.ts',
  },
  output: {
    path: path.resolve(__dirname, './dist/new-collections'),
    filename: 'background.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
};
