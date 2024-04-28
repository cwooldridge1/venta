#!/usr/bin/env node
import { build } from 'vite';
import { defineConfig } from 'vite';
import { getBuildConfig } from './config/utils/get-config.js';


async function startVite() {
  try {

    await build(defineConfig(getBuildConfig('production')))

  } catch (err) {
    console.error('Failed to start the server:', err);
    process.exit(1);
  }
}

startVite();
