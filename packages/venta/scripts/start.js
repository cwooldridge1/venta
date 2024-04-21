#!/usr/bin/env node
import { createServer, build } from 'vite';
import { defineConfig } from 'vite';
import rollupConfig from '../config/rollup.config.mjs';
import { warn } from 'console';
import path from 'path';
//import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';


const baseDir = path.resolve(process.cwd(), 'src/app');


async function startVite() {
  try {
    await build(defineConfig({
      resolve: {
        alias: {
          '@': baseDir,
        }
      },
      build: {
        rollupOptions: rollupConfig,
      },
    }));

    const server = await createServer(defineConfig({
      plugins: [],
      root: './dist',
      server: {
        port: DEFAULT_PORT,
        strictPort: false,
        host: HOST,
        open: false
      },
    }));

    await server.listen();
    server.printUrls();
  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
}

startVite();
