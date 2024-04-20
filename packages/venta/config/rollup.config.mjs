import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import html from '@rollup/plugin-html';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { terser } from 'rollup-plugin-terser';
import babelPresetVenta from 'babel-preset-venta';




const buildPath = process.env.BUILD_PATH || 'src';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.join(__dirname, '..');

const baseDir = path.resolve(process.cwd(), buildPath + '/app');

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
        name = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
      } else {
        name = prefix + name; // Use file name for non-'page' files
      }

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
      dir: './dist',
      format: 'es',
      entryFileNames: '[name].js',
    },
  ],
  preserveEntrySignatures: 'allow-extension', // if this is not here then the default exports of the pages are lost -- https://rollupjs.org/configuration-options/#preserveentrysignatures
  plugins: [
    resolve(), // Resolve node modules
    commonjs(), // Convert CommonJS modules to ES6
    typescript(), // Handle TypeScript files
    babel({
      babelHelpers: 'bundled',
      presets: [babelPresetVenta],
    }),
    html({
      template: () => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Application</title>
</head>
<body id='root'>
  <script type='module' src='core.js'></script>
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

const coreScript = {
  input: `${parentDir}/routing.ts`,
  output: {
    dir: './dist',
    entryFileNames: 'core.js',
    format: 'iife', // this means it will be a self-executing function
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    babel({
      babelHelpers: 'bundled',
      presets: [babelPresetVenta],
    }),
    inlineScript(),
    terser()
  ],
};



function inlineScript() {
  return {
    name: 'inline-script',
    generateBundle(outputOptions, bundle) {
      let baseDir = outputOptions.dir;
      if (!baseDir && outputOptions.file) {
        baseDir = path.dirname(outputOptions.file);
      }

      if (!baseDir) {
        console.error('InlineScript plugin error: Output directory is undefined.');
        return;
      }

      const routingFileKey = Object.keys(bundle).find(key => bundle[key].fileName === 'routing.js');
      if (!routingFileKey) {
        console.log('InlineScript plugin: No routing.js file found in the bundle.');
        return;
      }
      const routingFile = bundle[routingFileKey];
      const inlineScriptTag = `<script type="module">${routingFile.code}</script>`;

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


export default [mainConfig, coreScript]
