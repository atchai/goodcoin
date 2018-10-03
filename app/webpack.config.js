const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './app/src/index.js'
  ,
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    hot: true,
    watchContentBase: true,
    historyApiFallback: true,
    publicPath:'/app/assets/',

  },
  watchOptions: {
    aggregateTimeout: 600,
    poll: true
  },
  module: {
   
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015']
            }
        }
      },
      {
        use: ['style-loader', 'css-loader'],
        test: /\.css$/
      },
    ]
  },
  resolveLoader: {
    modules: ['node_modules'],
},
  resolve: {
    modules: [
    path.resolve(__dirname, "build/contracts"), 
    "node_modules"]

  },
 
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};
