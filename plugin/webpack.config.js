// Import the HtmlWebpackPlugin, which simplifies the creation of HTML files to serve your webpack bundles.
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Import the InlineChunkHtmlPlugin, which is used to inline webpack runtime chunks in HTML files.
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

// Import the path module, which provides utilities for working with file and directory paths.
const path = require('path');

// Export the webpack configuration as a function, which takes environment variables (env) and arguments (argv).
module.exports = (env, argv) => ({
  // Set the mode to 'production' if the mode argument is 'production', otherwise set it to 'development'.
  mode: argv.mode === 'production' ? 'production' : 'development',

  // Set the devtool option. Use 'inline-source-map' for development mode to aid in debugging.
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  // Define the entry points for the application. The 'ui' entry point is for the React frontend, and the 'code' entry point is for the plugin controller.
  entry: {
    ui: './src/app/index.tsx', // Entry point for the React application
    code: './src/plugin/controller.ts', // Entry point for the plugin controller
  },

  // Define the module rules, which specify how different types of files should be processed.
  module: {
    rules: [
      // Use 'ts-loader' for processing TypeScript files (.ts and .tsx).
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },

      // Use 'style-loader', 'css-loader', and 'postcss-loader' for processing CSS files.
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },

      // Use 'url-loader' for processing image files (png, jpg, gif, webp, svg).
      { test: /\.(png|jpg|gif|webp|svg)$/, loader: 'url-loader' },
    ],
  },

  // Specify file extensions to be resolved automatically and configure alias for module resolution.
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'], // Automatically resolve these file extensions
    alias: {
      '@': path.resolve(__dirname, 'src/app/'), // Create an alias '@' that points to 'src/app/'
    },
  },

  // Define the output options, specifying the output directory and file naming convention.
  output: {
    filename: '[name].js', // Use the entry point name for the output file name.
    path: path.resolve(__dirname, 'dist'), // Output directory is 'dist'.
  },

  // Define the plugins to be used.
  plugins: [
    // HtmlWebpackPlugin simplifies the creation of an HTML file to include the webpack bundles.
    new HtmlWebpackPlugin({
      template: './src/app/index.html', // Template HTML file to use
      filename: 'ui.html', // Output HTML file name
      chunks: ['ui'], // Include only the 'ui' chunk in this HTML file
      cache: false, // Disable caching
    }),

    // InlineChunkHtmlPlugin inlines the webpack runtime chunk into the HTML file.
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/ui/]),
  ],
});
