const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',  // Entry point for your TypeScript code
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')  // Where bundled files will be placed
    },
    resolve: {
        extensions: ['.ts', '.js']  // Resolving .ts and .js file extensions
    },
    module: {
        rules: [
            {
                test: /\.ts$/,  // Compile .ts files using ts-loader
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'),  // Serve static files from the dist/ folder
        },
        open: true,  // Automatically open the browser
        port: 4210,  // Serve on port 4210
        hot: true,   // Enable Hot Module Replacement (HMR)
    },
    performance: {
        maxAssetSize: 500000,  // Set the max size of any asset (in bytes)
        maxEntrypointSize: 500000,  // Set the max size of the combined entry point (in bytes)
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'  // Template HTML file
        })
    ]
};
