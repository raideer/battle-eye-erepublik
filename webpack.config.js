const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

const exportPath = process.env.EXPORT_PATH || 'build';

module.exports = {
    entry: ['babel-polyfill', './src/index.js'],
    output: {
        filename: 'battle-eye.user.js',
        path: path.resolve(exportPath)
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            'react',
                            ['env', {
                                targets: {
                                    uglify: true
                                }
                            }]
                        ]
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader'
                }, {
                    loader: 'sass-loader'
                }]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.BannerPlugin({
            banner: `// ==UserScript==
// @name        Battle Eye
// @namespace   battle-eye-live
// @author      Industrials
// @homepage    https://docs.google.com/spreadsheets/d/1Ebqp5Hb8KmGvX6X0FXmALO30Fv-IyfJHUGPkjKey8tg
// @description Live battle statistics for eRepublik
// @include     http*://www.erepublik.com/*/military/battlefield*
// @version     ${require('./package.json').version}
// @require     https://dl.dropboxusercontent.com/s/tslnlj6lqy63flm/notify.js
// @require     https://dl.dropboxusercontent.com/s/7n5isalxf0y6rza/xlsx-populate.js
// @run-at      document-idle
// @grant       none
// @noframes
// ==/UserScript==
            `,
            raw: true,
            entryOnly: true
        })
    ]
};
