#!/usr/bin/env node
import { createServer, build } from 'vite';
import { defineConfig } from 'vite';
import { getBuildConfig } from './config/utils/get-config.js';

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 80;
const HOST = process.env.HOST || '0.0.0.0';


async function startVite() {
  try {

    await build(defineConfig(getBuildConfig('production')))

    const serverConfig = defineConfig({
      base: process.env.VENTA_BASE_PATH || '/',
      root: './dist',
      mode: 'production',
      server: {
        port: DEFAULT_PORT,
        strictPort: false,
        host: HOST,
        open: false
      }
    });

    const server = await createServer(serverConfig);

    await server.listen();
    server.printUrls();

  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
}

startVite();
