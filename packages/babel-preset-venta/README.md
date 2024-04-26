# babel-preset-venta

This package includes the Babel preset used by [Create Venta App](https://ventajs.dev).<br>
Please refer to its documentation:

- [Getting Started](https://venta.dev/getting-started) – How to create a new app.

## Usage in Create Venta Projects

The easiest way to use this configuration is with [Create Venta App](https://github.com/cwooldridge/venta.js/packages/create-venta-app), which includes it by default. **You don’t need to install it separately in Create Venta App projects.**

## Usage Outside of Create Venta App

If you want to use this Babel preset in a project not built with Create Venta App, you can install it with the following steps.

First, [install Babel](https://babeljs.io/docs/setup/).

Then install babel-preset-venta.

```sh
npm install babel-preset-venta --save-dev
```

Then create a file named `.babelrc` with following contents in the root folder of your project:

```json
{
  "presets": ["venta"]
}
