const path = require('path');

module.exports = {
  entry: './src/App.tsx',
  output: {
    path: path.resolve(__dirname, 'built'),
    filename: 'app.bundle.js'
  },
  externals: {
    react: 'React',
    redux: 'Redux',
    'react-dom': 'ReactDOM',
    'react-redux': 'ReactRedux'
  },
  module: {
    rules: [
      {test: /\.(ts|tsx)$/, use: 'ts-loader'}
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx']
  }
};