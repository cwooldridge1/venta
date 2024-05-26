import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import html from '@rollup/plugin-html';
import path from 'path';
import { fileURLToPath } from 'url';
import babelPresetVenta from 'babel-preset-venta';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.join(__dirname, '../..');



const coreScript = {
  input: `${parentDir}/routing/spa-router.ts`,
  output: {
    entryFileNames: 'core.js',
    format: 'iife', // this means it will be a self-executing function
    assetFileNames: `assets/[name].[ext]`
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      presets: [babelPresetVenta],
    }),
    //     html({
    //       template: ({ files }) => {
    //         const styles = files.css ? files.css.map(({ fileName }) => `<link rel='stylesheet' href='${fileName}' />`).join('\n') : '';
    //         console.log('styles', styles)
    //
    //         return `<!DOCTYPE html>
    // <html lang="en">
    // <head>
    //     <meta charset="UTF-8">
    //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //
    //     ${styles}
    //     <link rel="icon" href="/assets/favicon.ico" type="image/x-icon">
    //     <title>Your Application</title>
    // </head>
    // <body id='root'>
    //   <script type='module' src='core.js'></script>
    // </body>
    // </html>
    // `;
    //       },
    //       fileName: 'index.html',
    //     }),
  ],

};


export default coreScript
