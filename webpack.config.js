const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: './src/js/main.js',
	mode: 'production',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
	},
	plugins: [
		new CopyWebpackPlugin([
			{
				from: __dirname + '/src/css'
			},
			{
				from: __dirname + '/src/html'
			}
		]),
		new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
	],
	module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '../'
            }
          },
          "css-loader"
        ]
      }
    ]
  }
};
