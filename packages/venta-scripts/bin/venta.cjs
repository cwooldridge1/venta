#!/usr/bin/env node

'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const { spawn } = require('child_process');
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === 'build' || x === 'start'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (['build', 'start', 'dev'].includes(script)) {
  const scriptPath = require.resolve(`../scripts/${script}.js`);
  const nodeArgsWithESM = ['--experimental-modules', scriptPath];

  const child = spawn(
    process.execPath,
    nodeArgs.concat(nodeArgsWithESM).concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' }
  );

  child.on('close', (code, signal) => {
    if (signal) {
      if (signal === 'SIGKILL') {
        console.log(
          'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.'
        );
      } else if (signal === 'SIGTERM') {
        console.log(
          'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.'
        );
      }
      process.exit(1);
    }
    process.exit(code);
  });

  child.on('error', (err) => {
    console.error('Failed to start subprocess.', err);
    process.exit(1);
  });
} else {
  console.log('Unknown script "' + script + '".');
  console.log('Perhaps you need to update venta-scripts?');
}
