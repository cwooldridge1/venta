const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Define the base directory for routes
const baseDir = path.resolve(__dirname, 'app/src/app');


const findRoutes = (dir = baseDir, prefix = '') => {
  let entries = {};
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Append the directory name to the prefix for the next level of recursion
      const subEntries = findRoutes(fullPath, prefix + file + '/');
      entries = { ...entries, ...subEntries };
    } else if (file.startsWith("page") && /\.(js|jsx|ts|tsx)$/.test(file)) {
      // Determine the entry name, removing 'page' if it's the file name, to represent the directory route
      let name = path.basename(file, path.extname(file));
      // If the file is named 'page', use the directory name as the route
      if (name === 'page') {
        name = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix; // Remove trailing slash for directory route
      } else {
        name = prefix + name; // Use file name for non-'page' files
      }

      // Clean up the leading slash if present and construct the key
      const key = '/' + name.replace(/^\//, '');
      entries[key] = fullPath;
    }
  });
  console.log(entries);
  return entries;
};

module.exports = {
  entry: { ...findRoutes(), venta: './src/index.ts' },
  target: 'node',
  output: {
    filename: '[name]bundle.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: "umd",
    library: "[name]" // This will name each global variable after its entry point key
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  mode: 'development', //dev
  devtool: 'eval-source-map',//dev
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/template.html', // (Optional) Specify a template file to use as a base
      inject: true, // Automatically inject all assets into the template
      // excludeChunks: ['venta'], // (Optional) Exclude chunks from the template being injected
    }),
  ],
};
