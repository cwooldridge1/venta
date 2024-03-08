import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel';
import html from '@rollup/plugin-html';
import path from 'path';
import fs from 'fs';


import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  return entries;
};

const entries = findRoutes();

// Generate input options for Rollup
const inputOptions = {};
Object.keys(entries).forEach(key => {
  const entryKey = key.startsWith('/') ? key.slice(1) : key; // Remove leading slash
  inputOptions[entryKey] = entries[key];
});


const mainConfig = {
  input: inputOptions,
  output: [
    {
      dir: 'dist',
      format: 'es',
      name: '[name]',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve(), // Resolve node modules
    commonjs(), // Convert CommonJS modules to ES6
    typescript(), // Handle TypeScript files
    babel({
      babelHelpers: 'bundled',
    }),
    getBabelOutputPlugin({
      presets: ['@babel/preset-env', '@babel/preset-react']
    }),
    // You might need to customize this or use a different plugin for complex HTML generation
    html({
      // This is a basic example
      template: ({ files }) => {

        // const scripts = files.js.map(({ fileName }) => `<script src="/${fileName}"></script>`).join('\n');
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Application</title>
</head>
<body id='root'>
    <script type='module' src="routing.js"></script>
</body>
</html>
`;
      },
      fileName: 'index.html',
      minify: true,
    }),
  ],
  // You might need to include external dependencies, depending on your project
  external: [],
};


const extraScriptConfig = {
  input: './src/scripts/routing.ts',
  output: {
    file: 'dist/routing.js',
    format: 'iife' // this means it will be a self-executing function
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env']
    }),
    inlineScript(),
  ],
};



function inlineScript() {
  return {
    name: 'inline-script',
    generateBundle(outputOptions, bundle) {
      // Ensure we have a directory to work with, handle both dir and file output options
      let baseDir = outputOptions.dir;
      if (!baseDir && outputOptions.file) {
        baseDir = path.dirname(outputOptions.file);
      }

      // Exit if we still don't have a valid directory
      if (!baseDir) {
        console.error('InlineScript plugin error: Output directory is undefined.');
        return;
      }

      // Generate the inline script content
      const routingFileKey = Object.keys(bundle).find(key => bundle[key].fileName === 'routing.js');
      if (!routingFileKey) {
        console.log('InlineScript plugin: No routing.js file found in the bundle.');
        return;
      }
      const routingFile = bundle[routingFileKey];
      const inlineScriptTag = `<script type="module">${routingFile.code}</script>`;

      // Define the HTML file path
      const htmlFilePath = path.join(baseDir, 'index.html');
      if (fs.existsSync(htmlFilePath)) {
        // Modify the HTML file to include the inline script
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        htmlContent = htmlContent.replace('<script type=\'module\' src="routing.js"></script>', inlineScriptTag);
        fs.writeFileSync(htmlFilePath, htmlContent);

        // Optionally, remove the now-inlined script from the bundle
        delete bundle[routingFileKey];
      } else {
        console.error(`InlineScript plugin: HTML file (${htmlFilePath}) does not exist.`);
      }
    }
  };
}


export default [mainConfig, extraScriptConfig];
