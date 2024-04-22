#!/usr/bin/env node
import { createServer, build } from 'vite';
import { defineConfig } from 'vite';
import rollupConfig from '../config/rollup.config.mjs';
import path from 'path';

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';


const baseDir = path.resolve(process.cwd(), 'src/app');


async function startVite() {
  try {
    const buildConfig = defineConfig({
      resolve: {
        alias: {
          '@': baseDir,
        }
      },
      css: {
        modules: {
          scopeBehaviour: 'local', // default is 'local'
          globalModulePaths: [/global\.css$/], // styles in files matching this pattern will be treated as global
          generateScopedName: '[name]__[local]___[hash:base64:5]', // custom format for generated class names
        }
      },
      mode: 'development',
      appType: 'spa',
      build: {
        rollupOptions: rollupConfig,
        emptyOutDir: false,
        minify: 'terser',
        watch: { // https://vitejs.dev/config/server-options.html#server-watch
          include: path.join(process.cwd(), '**/*'),
          awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 100
          }
        },
      },
      esbuild: {
        jsxFactory: 'VentaInternal.renderVentaNode',
      },
    })
    build(buildConfig);

    const serverConfig = defineConfig({
      root: './dist',
      server: {
        port: DEFAULT_PORT,
        strictPort: false,
        host: HOST,
        open: false
      }
    }
    );

    // const server = await createServer(serverConfig);
    //
    // await server.listen();
    // server.printUrls();

  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
}

startVite();
