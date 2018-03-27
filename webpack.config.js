module.exports = {
  mode: 'development',
  entry: { main: './src/main.ts', work: "./src/worker.ts" },
  output: {
    path: `${__dirname}/js`,
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
