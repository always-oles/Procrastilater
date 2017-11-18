const debug = process.env.NODE_ENV !== 'production';
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: [
        'babel-polyfill',
        './src/index.js' 
    ],
    output: {
        path: __dirname + '/extension/',
        filename: 'bundle.js'
    },
    devtool: debug 
        ? 'inline-sourcemap' 
        : 'cheap-module-source-map',
    module: {
        loaders: [{
                test: /\.js?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: [ 'es2015', 'react', 'stage-2' ],
                    plugins: ['react-html-attrs']
                }
            },
            {
                test: /\.sass$/,
                use: ExtractTextPlugin.extract({
                    use: [{ loader: 'css-loader' }, { loader: 'sass-loader' }],
                    publicPath: '../'
                }),
            },
            {
                test: /\.svg$|\.png$/,
                loader: 'file-loader',
                options: {
                    outputPath: 'images/'
                }
            },
            {
                test: require.resolve('./extension/sharedAPI.js'),
                use: 'exports-loader?sharedAPI'
            }
        ]
    },
    plugins: debug 
        ? [new ExtractTextPlugin('styles/style.css')] 
        : [
            new webpack.optimize.UglifyJsPlugin({
                comments: false,
                sourcemap: true,
                compress: {
                    warnings: false,
                    screw_ie8: true,
                    conditionals: true,
                    unused: true,
                    comparisons: true,
                    sequences: true,
                    dead_code: true,
                    evaluate: true,
                    if_return: true,
                    join_vars: true,
                    drop_console: true
                },
            }),
            new webpack.HashedModuleIdsPlugin(),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production')
            })
        ]
};