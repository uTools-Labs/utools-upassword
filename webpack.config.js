const path = require('path')
const outputPath = path.join(__dirname, 'dist')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  target: 'web',
  mode: 'development',
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].js',
    path: outputPath
  },
  plugins: [
    new CopyWebpackPlugin({ patterns: [{ from: 'public', to: outputPath }] })
  ],
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: { chrome: 80 } }], '@babel/preset-react'],
            plugins: [
              '@babel/plugin-transform-runtime',
              ['@babel/plugin-proposal-decorators', { 'legacy': true }],
              '@babel/plugin-proposal-class-properties',
              ['import', { libraryName: '@material-ui/core', libraryDirectory: 'esm', camel2DashComponentName: false }, 'core'],
              ['import', { libraryName: '@material-ui/lab', libraryDirectory: 'esm', camel2DashComponentName: false }, 'lab'],
              ['import', { libraryName: '@material-ui/icons', libraryDirectory: 'esm', camel2DashComponentName: false }, 'icons']
            ]
          }
        }
      },
      {
        test: /\.(less|css)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: { url: false }
          },
          {
            loader: 'less-loader'
          }
        ]
      }
    ]
  }
}
