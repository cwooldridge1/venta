/// <reference types="vite/client" />
import { VentaAppState } from "venta/src/state";
window.VentaAppState = VentaAppState;
import { VentaInternal } from "venta/src/internal";
import { createDeletionObserver } from "venta/src/utils/observers";
import { VentaNode } from "venta";
window.VentaInternal = VentaInternal;
import.meta.glob('/assets/**/*') // this is needed so the assets are copied to the dist folder

const BASE_PATH = import.meta.env.BASE_URL || '';

const pageModules = import.meta.glob('/**/page.{jsx,tsx,ts,js}',
  {
    import: 'default'
  }
) // this is generated at compile time - the / defaults to an alias see https://vitejs.dev/guide/features#glob-import-caveats


const layoutModules = import.meta.glob('/**/layout.{jsx,tsx,ts,js}',
  {
    import: 'default'
  }
)

const loadingModules = import.meta.glob('/**/loading.{jsx,tsx,ts,js}', {
  import: 'default',
  eager: true // This option will make Vite load the modules immediately
});


const modulesToRoutes = (imports: Record<string, () => Promise<unknown>>): { [key: string]: () => Promise<any> } => {
  return Object.fromEntries(Object.entries(imports).map(([key, value]) => {
    const baseRoute = key.replace('/src/app/', '')
    const routeParts = baseRoute.split('/')
    routeParts.pop()
    if (routeParts.length === 0) {
      return [BASE_PATH + '/', value]
    }
    const route = routeParts.join('/')
    return [BASE_PATH + '/' + route + '/', value]
  }))
}

const routes = modulesToRoutes(pageModules)
const layouts = modulesToRoutes(layoutModules)

const pathToRegex = (path: string) => {
  const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexString = escapedPath.replace(/\[.*?\]/g, '([^/]+)');
  return new RegExp(`^${regexString}$`);
};

const isURLMatch = (routePath: string, userPath: string) => {
  const regex = pathToRegex(routePath);
  return regex.test(userPath);
};

const getLayout = async (path: string, children: VentaNode) => {
  const urlParts = path.split('/');
  let lastLayout = null;

  let i = urlParts.length
  const baseLength = BASE_PATH.split('/').length

  while (i-- > baseLength) {
    const route = urlParts.slice(0, i).join('/') + '/';

    const match = Object.entries(layouts).find(([key, _]) => {
      if (isURLMatch(key, route)) {
        return true;
      }
      return false;
    })
    if (match) {
      const layoutComponent = await match[1]();
      if (lastLayout === null) {
        lastLayout = layoutComponent({ children })
      } else {
        lastLayout = layoutComponent({ children: lastLayout })
      }
    }
  }
  return lastLayout;
}

const matchRoute = (path: string) => {

  const arr = Object.keys(routes)

  for (let i = 0; i < arr.length; i++) {
    const route = arr[i]
    if (isURLMatch(route, path)) {
      return route
    }
  }
  return null;
}


// Create an observer instance
const deletionObserver = createDeletionObserver();



export const handleLocation = async () => {
  let path = window.location.pathname;
  if (!path.endsWith('/')) {
    path += '/'
  }
  if (path.endsWith('/index.html')) {
    path = path.substring(0, path.length - '/index.html'.length)
  }
  if (!routes[path]) {
    path = matchRoute(path) || '/404'
  }

  const component = await routes[path]()
  const renderedComponent = VentaInternal.createComponent(component, {})

  const layout = await getLayout(path, renderedComponent)

  document.replaceChild(layout, document.documentElement);

  const config = { childList: true, subtree: true }
  if (VentaAppState.componentCleanUpMap.size > 0) {
    deletionObserver.disconnect();
    deletionObserver.observe(renderedComponent, config);
  }
};

window.onpopstate = handleLocation;
window.addEventListener('venta-link', function() {
  handleLocation();
});

handleLocation();

