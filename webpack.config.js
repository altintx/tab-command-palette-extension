const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  plugins: [new MiniCssExtractPlugin()],
  entry: {
    popup: './src/popup.ts',
    background: './src/background.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
     },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.css'],
  },
};
