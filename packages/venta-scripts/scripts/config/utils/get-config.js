import path from 'path';
import fs from 'fs';
import rollupConfig from '../rollup.config.mjs';
import { DEFAULT_IMPORT_ALIAS } from '../constants.js';
import { config } from 'dotenv';

config();

export function getDefaultImportAlias(dir) {
  const tsConfigPath = path.join(dir, 'tsconfig.json');
  const jsConfigPath = path.join(dir, 'jsconfig.json');
  let configPath = '';

  if (fs.existsSync(tsConfigPath)) {
    configPath = tsConfigPath;
  } else if (fs.existsSync(jsConfigPath)) {
    configPath = jsConfigPath;
  } else {
    return null;
  }

  try {
    const configJson = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configJson);

    if (config.compilerOptions && config.compilerOptions.paths) {
      return Object.fromEntries(Object.entries(config.compilerOptions.paths)
        .map(([key, value]) => {
          const prefix = key[0].split('/')[0];
          const pathParts = value[0].split('/');
          pathParts.shift();
          pathParts.pop();
          const prefixPath = path.resolve(process.cwd(), pathParts.join('/'));
          return [prefix, prefixPath]
        }));
    }
  } catch (error) {
    console.error('Failed to read or parse the configuration file:', error);
    return null;
  }

  return null;
}

export function getBuildConfig(mode) {
  const isDev = mode === 'development';
  const outputDir = 'dist';


  const alias = getDefaultImportAlias(process.cwd()) || DEFAULT_IMPORT_ALIAS

  return {
    base: process.env.VENTA_BASE_PATH || '/',
    css: {
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]',
        hashPrefix: 'venta'
      },
    },
    resolve: {
      alias
    },
    mode,
    appType: 'spa',
    build: {
      outDir: `${process.cwd()}/${outputDir}`,
      sourcemap: isDev,
      rollupOptions: rollupConfig,
      emptyOutDir: !isDev,
      minify: isDev ? false : 'terser',
    },
    esbuild: {
      jsxFactory: 'VentaInternal.renderVentaNode',
    },
  }
}
