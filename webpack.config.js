'use strict';

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const Html = require('./html'); // html.js

module.exports = {
    entry: {
        vendor: ['jquery', 'angular', 'bootstrap', 'angular-route', 'angular-animate', 'angular-aria',
            'angular-ui-bootstrap', 'angular-loading-bar', 'angular-websocket', 'angular-google-analytics',
            'angular-translate', 'angular-translate-loader-static-files', 'echarts', 'angular-echarts-lite',
            'js-sha256'],
        app: "./entry.js"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].bundle.js"
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    },

    optimization:{
        splitChunks: {
            name: 'vendor'
        }
    },

    node: {
        fs: 'empty',
        tls: 'empty'
    },

    plugins: [
        new webpack.ProvidePlugin({
            jdenticon: "jdenticon",
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),

        new CopyWebpackPlugin([{
                from: path.resolve(__dirname, `./node_modules/components-font-awesome/webfonts`),
                to: path.resolve(__dirname, './dist/webfonts')
            }]
        ),
        new CopyWebpackPlugin([{
                from: path.resolve(__dirname, `./app/images`),
                to: path.resolve(__dirname, './dist/images')
            }]
        ),

        new CopyWebpackPlugin([{
                from: path.resolve(__dirname, `./app/charting_library`),
                to: path.resolve(__dirname, './dist/charting_library')
            }]
        ),
        new CopyWebpackPlugin([{
                from: path.resolve(__dirname, `./app/i18n`),
                to: path.resolve(__dirname, './dist/i18n')
            }]
        ),
        new CopyWebpackPlugin(
            Html.map(html => {
                return {
                    from: path.resolve(__dirname, `./app/${html}`),
                    to: path.resolve(__dirname, './dist/html')
                };
            })
        ),
        new HtmlWebpackPlugin({
            hash: true,
            template: __dirname + '/app/index.html',
            filename: __dirname + '/dist/index.html'
        })
    ]
};