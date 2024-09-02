const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets/*.png', to: 'assets' } // Adjust the paths as necessary
      ],
    }),
  ],
  entry: {
    popup: './src/app.tsx',
    background: './src/background.ts',
    "content-script": './src/content-script.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
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
    extensions: ['.ts', '.js', '.css', '.tsx'],
  },
};
