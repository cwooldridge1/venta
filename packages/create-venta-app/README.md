# Create Venta App

The easiest way to get started with Venta.js is by using `create-venta-app`. This CLI tool enables you to quickly start building a new Venta.js application, with everything set up for you. You can create a new app using the default Venta.js template. To get started, use the following command:

### Interactive

You can create a new project interactively by running:

```bash
npx create-venta-app@latest
# or
yarn create venta-app
# or
pnpm create venta-app
# or
bunx create-venta-app
```

You will be asked for the name of your project, and then whether you want to
create a TypeScript project:

```bash
✔ Would you like to use TypeScript? … No / Yes
```


Aswell as whether you want to use Tailwind CSS:
```bash
✔ Would you like to use Tailwind CSS? … No / Yes

```

Select **Yes** to install the necessary types/dependencies and create a new TS project.

### Non-interactive

You can also pass command line arguments to set up a new project
non-interactively. See `create-venta-app --help`:

```bash
Usage: create-venta-app <project-directory> [options]

Options:
  -V, --version                        output the version number
  --ts, --typescript

    Initialize as a TypeScript project. (default)

  --js, --javascript

    Initialize as a JavaScript project.

  --tailwind

    Initialize with Tailwind CSS config. (default)


  --import-alias <alias-to-configure>

    Specify import alias to use (default "@/*").

  --use-npm

    Explicitly tell the CLI to bootstrap the app using npm

  --use-pnpm

    Explicitly tell the CLI to bootstrap the app using pnpm

  --use-yarn

    Explicitly tell the CLI to bootstrap the app using Yarn

  --use-bun

    Explicitly tell the CLI to bootstrap the app using Bun

  --reset-preferences

    Explicitly tell the CLI to reset any stored preferences

  -h, --help                           output usage information
```

### Why use Create Venta App?

`create-venta-app` allows you to create a new Venta.js app within seconds. It is officially maintained by the creator of Venta.js, and includes a number of benefits:

- **Interactive Experience**: Running `npx create-venta-app@latest` (with no arguments) launches an interactive experience that guides you through setting up a project.
- **Offline Support**: Create Venta App will automatically detect if you're offline and bootstrap your project using your local package cache.
- **Support for Examples**: Create Venta App can bootstrap your application using an example from the Venta.js examples collection (e.g. `npx create-venta-app --example api-routes`).
