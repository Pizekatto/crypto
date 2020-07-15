const path = require('path') // модуль для работы с путями node.js
const HTMLWebpackPlugin = require('html-webpack-plugin') // подключаем класс
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev
const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`
  // [name], [hash] - паттерны в node.js

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  }

  if (isProd) {
    config.minimizer = [
      new OptimizeCSSAssetsWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }

  return config
}

const jsLoaders = () => {
  const loaders = [{
    loader: 'babel-loader',
    options: {
      presets: [
        '@babel/preset-env'
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties'
      ]
    }
  }]

  if (isDev) {
    loaders.push('eslint-loader')
  }

  return loaders
}

const plugins = () => {
  const base = [ // плагины должны подключаться как экземпляры класса
    new HTMLWebpackPlugin({
      template: 'index.html', // в какой файл будут подключаться скрипты
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(), // очистка path
    new CopyPlugin({
      patterns: [ // копирование файлов
        {
          from: path.resolve(__dirname, 'src/assets/images'),
          to: path.resolve(__dirname, 'dist/assets/images')
        },
        {
          from: path.resolve(__dirname, 'src/startData.json'),
          to: path.resolve(__dirname, 'dist')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: filename('css')
    })
  ]

  // if (isProd) {
  //   base.push(new BundleAnalyzerPlugin())
  // }

  return base
}

module.exports = {
  context: path.resolve(__dirname, 'src'), // все пути будут отталкиваться от этой папки
  mode: 'development', // режим по умолчанию
  entry: { // точка входа, откуда начать
    main: [
      '@babel/polyfill',
      './index.js'
    ]
  },
  output: { // куда складывать
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.json', '.png'], // какие расширения должен понимать webpack, для них можно не писать расширение
    alias: { // алиасы заменяют часть пути к файлам
      '~': path.resolve(__dirname, 'node_modules'),
      '@': path.resolve(__dirname, 'src'),
      '@images': path.resolve(__dirname, 'src/assets/images'),
    }
  },
  optimization: optimization(),
  devServer: {
    port: 4205,
    host: '192.168.0.2',
    hot: false
  },
  devtool: isDev ? 'source-map' : '',
  plugins: plugins(),
  module: {
    rules: [{
        test: /\.css$/, // регулярное выражение, если есть совпадение, то используем лоадеры из use
        use: [{
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: isDev,
                reloadAll: true
              }
            },
            'css-loader'
          ] // лоадеры, порядок вызова справа налево
          // css-loader обрабатывает css
      },
      {
        test: /\.s[ac]ss$/,
        use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpg|jpeg|png|svg|gif|webp)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        }]
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        }]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript'
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }]
      },
    ]
  }
}