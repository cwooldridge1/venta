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
  console.log(entries);
  return entries;
};

const entries = findRoutes();

// Generate input options for Rollup
const inputOptions = {};
Object.keys(entries).forEach(key => {
  const entryKey = key.startsWith('/') ? key.slice(1) : key; // Remove leading slash
  inputOptions[entryKey] = entries[key];
});


export default {
  input: inputOptions,
  output: [
    {
      dir: 'dist',
      format: 'es',
      // file: 'bundle.js',
      // name: '[name]', // This might need to be adjusted based on your specific needs
      // entryFileNames: '[name]bundle.js',
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
    <!-- <script src="/ventabundle.js"></script> -->
    <script type="module">
      const handleLocation = async () => {
        const path = window.location.pathname;
        // Dynamically import the module based on the current path
        console.log('trying');
        const module = await import('./'+path+'.js');
        console.log('module', module);
        // Assuming the module exports a component or function that can be rendered
        const component = module.default; // or whatever the exported component is named
        console.log('component', component);
        const root = document.getElementById("root");
        root.innerHTML = '';
        if (component) {
          root.appendChild(component());
        }
      };

      window.onpopstate = handleLocation;
      window.addEventListener('venta-link', function() {
        handleLocation();
      });

      handleLocation();
    </script>
    <title>Your Application</title>
</head>
<body id='root'>

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
