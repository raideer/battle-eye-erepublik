const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

const exportPath = process.env.EXPORT_PATH || 'build';

module.exports = {
    entry: './src/index.js',
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
                        presets: ['es2017', 'react']
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
        new webpack.BannerPlugin({
            banner: `// ==UserScript==
// @name        Battle Observer
// @namespace   battle-observer
// @author      Industrials
// @homepage    https://docs.google.com/spreadsheets/d/1Ebqp5Hb8KmGvX6X0FXmALO30Fv-IyfJHUGPkjKey8tg
// @description Live battle statistics for eRepublik
// @include     http*://www.erepublik.com/*/military/battlefield-new/*
// @version     ${require('./package.json').version}
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
