module.exports = {
  mode: 'development',
  entry: { main: './src/main.ts', StrWorker: "./src/StrWorker.ts", TransWorker: "./src/TransWorker.ts", SABWorker: "./src/SABWorker.ts" },
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
