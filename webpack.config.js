module.exports = {
    mode: 'development',
    entry: './src/main.ts',
    output: {
      path: `${__dirname}/js`,
      // 出力ファイル名
      filename: 'bundle.js'
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
    }
  };
  