const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

const exportPath = process.env.EXPORT_PATH || 'build';

const plugins = [];

if (process.env.NODE_ENV == 'production') {
    plugins.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
    }));

    plugins.push(new webpack.optimize.UglifyJsPlugin());
}

plugins.push(new webpack.BannerPlugin({
    banner: `// ==UserScript==
// @name        Battle Eye Live
// @namespace   battle-eye-live
// @author      Industrials
// @homepage    https://docs.google.com/spreadsheets/d/1Ebqp5Hb8KmGvX6X0FXmALO30Fv-IyfJHUGPkjKey8tg
// @description Live battle statistics for eRepublik
// @include     http*://www.erepublik.com/*/military/battlefield*
// @version     ${require('./package.json').version}
// @require     https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js
// @require     https://dl.dropboxusercontent.com/s/7n5isalxf0y6rza/xlsx-populate.js
// @run-at      document-idle
// @grant       none
// @noframes
// ==/UserScript==`,
    raw: true,
    entryOnly: true
}));

module.exports = {
    entry: ['babel-polyfill', './src/index.js'],
    output: {
        filename: 'battle-eye-live.user.js',
        path: path.resolve(exportPath)
    },
    externals: {
        'chart.js': 'Chart',
        jQuery: 'jQuery'
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
                                    browsers: [
                                        'last 4 versions'
                                    ]
                                }
                            }]
                        ]
                    }
                }
            },
            {
                test: /\.(scss|sass)$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader'
                }, {
                    loader: 'sass-loader'
                }]
            },
            {
                test: /\.(css)$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'postcss-loader'
                }]
            }
        ]
    },
    plugins: plugins
};
