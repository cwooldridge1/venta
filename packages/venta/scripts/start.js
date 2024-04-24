#!/usr/bin/env node
import { createServer, build } from 'vite';
import { defineConfig } from 'vite';
import rollupConfig from '../config/rollup.config.mjs';
import path from 'path';
import glob from 'glob';
import { fileURLToPath } from 'url';

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';


const baseDir = path.resolve(process.cwd(), 'src/app');


async function startVite() {
  try {

    const baseBuild = {
      css: {
        modules: {
          generateScopedName: '[name]__[local]___[hash:base64:5]',
          hashPrefix: 'venta'
        },
      },
      resolve: {
        alias: {
          '@': baseDir,
        }
      },
      mode: 'development',
      appType: 'spa',
      build: {
        rollupOptions: rollupConfig,
        emptyOutDir: false,
        minify: 'terser',
      },
      esbuild: {
        jsxFactory: 'VentaInternal.renderVentaNode',
      },
    }

    await build(defineConfig(baseBuild))

    // this allows to watch the files and rebuild on change 
    const watchBuildConfig = {
      ...baseBuild, build: {
        ...baseBuild.build, watch: {
          // https://vitejs.dev/config/build-options.html#build-watch
          include: path.join(process.cwd(), '**/*'),
          awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 100
          }
        },
      }
    }

    // we also need this because this is not actually able to be
    // awaited but we need it to the watch the files once the server is running
    build(defineConfig(watchBuildConfig));


    const serverConfig = defineConfig({
      root: './dist',
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
