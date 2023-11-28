const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: {
        app: './client/chat.jsx',
        login: './client/login.jsx',
        settings: './client/settings.jsx',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    mode: 'production',
    watchOptions: {
        aggregateTimeout: 200,
    },
    output: {
        path: path.resolve(__dirname, 'hosted'),
        filename: '[name]Bundle.js',
    },
    optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            extractComments: false,
          }),
        ],
      },
};