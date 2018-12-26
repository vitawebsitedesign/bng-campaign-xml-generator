const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
		])
	]
};
