#!/usr/bin/env node
import { createServer } from 'vite';
import { defineConfig } from 'vite';
import rollupConfig from '../config/rollup.config.mjs';

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function startVite() {
  try {
    const server = await createServer(defineConfig({
      plugins: [],
      server: {
        port: DEFAULT_PORT,
        strictPort: false,
        host: HOST,
        open: true
      },
      build: {
        rollupOptions: {
          plugins: [
            rollupConfig() // Example Rollup plugin
          ]
        }
      }
    }));

    await server.listen();
    server.printUrls();
  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
}

startVite();
