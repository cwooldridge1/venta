#!/usr/bin/env node
import { createServer, build } from 'vite';
import { defineConfig } from 'vite';
import rollupConfigs from '../config/rollup.config.mjs';

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function startVite() {
  try {
    const promisses = rollupConfigs.map(async (rollupConfig) => {
      return await build(defineConfig({
        plugins: [],
        build: {
          rollupOptions: rollupConfig,
        }
      }));
    })
    await Promise.all(promisses);

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
