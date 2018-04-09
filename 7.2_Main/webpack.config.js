module.exports = {
  mode: 'development',
  entry: { main: './src/main.ts', worker: "./src/worker.ts" },
  output: {
    path: `${__dirname}/WebContent`,
    // 出力ファイル名
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: [
      '.ts'
    ]
  },
  devtool: 'source-map'
};
