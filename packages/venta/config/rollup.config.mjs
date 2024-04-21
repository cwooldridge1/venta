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


const coreScript = {
  input: `${parentDir}/src/routing.ts`,
  output: {
    dir: './dist',
    entryFileNames: 'core.js',
    format: 'iife', // this means it will be a self-executing function
  },
  logLevel: 'error',
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: `${parentDir}/tsconfig.json`
    }),
    babel({
      babelHelpers: 'bundled',
      presets: [babelPresetVenta],
    }),
    terser(),
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
    }),
  ],

};


export default coreScript
