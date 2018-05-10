const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

const plugins = [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
];

if (process.env.NODE_ENV == 'production') {
    plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
    entry: {
        'build/battleeye': ['babel-polyfill', './src/index.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname)
    },
    externals: {
        jQuery: 'jQuery'
    },
    resolve: {
        alias: {
            'chart.js': 'chart.js/dist/Chart.js'
        }
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
