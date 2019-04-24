/*
 *                                                               _
 *   _____  _                           ____  _                 |_|
 *  |  _  |/ \   ____  ____ __ ___     / ___\/ \   __   _  ____  _
 *  | |_| || |  / __ \/ __ \\ '_  \ _ / /    | |___\ \ | |/ __ \| |
 *  |  _  || |__. ___/. ___/| | | ||_|\ \___ |  _  | |_| |. ___/| |
 *  |_/ \_|\___/\____|\____||_| |_|    \____/|_| |_|_____|\____||_|
 *
 *  ===============================================================
 *             More than a coder, More than a designer
 *  ===============================================================
 *
 *  - Document: webpack.config.js
 *  - Author: aleen42
 *  - Description: A configuration file for configuring Webpack
 *  - Create Time: Apr 24th, 2019
 *  - Update Time: Apr 24th, 2019
 *
 */
const path = require('path');

module.exports = {
    entry: './index.js',
    mode: 'production',
    output: {
        publicPath: '',
        path: path.join(__dirname, 'dist'),
        filename: 'watermark.dist.js',
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules'],
    },
    module: {
        rules: [
            {
                /** babel */
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env', 'es2015'],
                    },
                },
            },
        ],
    },
};
