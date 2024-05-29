/// <reference types="vite/client" />
import { VentaAppState } from "venta/src/state";
window.VentaAppState = VentaAppState;
import { VentaInternal } from "venta/src/internal";
import { createDeletionObserver } from "venta/src/utils/observers";
import { NodeTypes } from "venta";
window.VentaInternal = VentaInternal;
import.meta.glob('/assets/**/*') // this is needed so the assets are copied to the dist folder

const BASE_PATH = import.meta.env.BASE_URL || '';

const pageModules = import.meta.glob('/**/page.{jsx,tsx,ts,js}',
  {
    import: 'default'
  }
) as Record<string, () => Promise<Venta.ComponentType | Promise<Venta.ComponentType>>>;
// this is generated at compile time - the / defaults to an alias see https://vitejs.dev/guide/features#glob-import-caveats


const layoutModules = import.meta.glob('/**/layout.{jsx,tsx,ts,js}',
  {
    import: 'default'
  }
) as Record<string, () => Promise<Venta.ComponentType | Promise<Venta.ComponentType>>>;

const loadingModules = import.meta.glob('/**/loading.{jsx,tsx,ts,js}', {
  import: 'default',
  eager: true // This option will make Vite load the modules immediately
}) as Record<string, () => NodeTypes>;


const modulesToRoutes = (imports: Record<string, () => any>) => {
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
const loaders = modulesToRoutes(loadingModules)

const pathToRegex = (path: string) => {
  const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexString = escapedPath.replace(/\\\[.*?\\\]/g, '([^/]+)');
  return new RegExp(`^${regexString}$`);
};

const isURLMatch = (routePath: string, userPath: string) => {
  const regex = pathToRegex(routePath);
  return regex.test(userPath);
};


const renderPage = async (path: string, children: () => NodeTypes) => {
  const urlParts = path.split('/');
  let lastLoader: Comment | NodeTypes = document.createComment('venta-loader');
  let hasPainted = false;

  let i = BASE_PATH.split('/').length


  //ultimatly we want to get all the layouts, for each level and also get the associated loader for each level if applicable
  const layoutLayers: (Promise<Venta.ComponentType> | null)[] = [];
  const loaderLayers: (() => NodeTypes | null)[] = []

  let lastContent: NodeTypes;
  let lastContentChildAnchor: Comment;


  while (i++ < urlParts.length) {
    const route = urlParts.slice(0, i + 1).join('/');
    const match = Object.entries(layouts).find(([key, _]) => {
      if (isURLMatch(key, route)) {
        return true;
      }
      return false;
    })

    const loader = getLoader(route)
    loaderLayers.push(loader)

    if (match) {
      layoutLayers.push(match[1]())
    }
    else {
      layoutLayers.push(null)
    }
  }
  if (layoutLayers.filter(v => v).length === 0) {
    throw new Error('No layout file found. Must include root layout file.')
  }
  // now we can essentiall construct the layout tree
  for (let i = 0; i < layoutLayers.length; i++) {
    const loader = loaderLayers[i];



    // if there is a new loader and the root element has been painted then we neeed to displaying the lastest content replace the anchor with the new loader and continue
    if (loader && hasPainted) {
      const loadedLoader = loader();

      lastLoader.replaceWith(lastContent);
      lastContentChildAnchor.replaceWith(loadedLoader);
      lastLoader = loadedLoader;
    }


    const layoutComponent = await layoutLayers[i];

    if (layoutComponent) {
      const newChildAnchor = document.createComment('venta-layout-anchor');
      const renderedComponent = await layoutComponent({ children: newChildAnchor });
      if (!hasPainted) {
        document.replaceChild(renderedComponent, document.documentElement);
        hasPainted = true;
      }
      else {
        lastContentChildAnchor.replaceWith(renderedComponent);
        lastContentChildAnchor = newChildAnchor;
      }
    }
  }

  const renderedChildren = await children();

  lastContentChildAnchor.replaceWith(renderedChildren);


  lastLoader.replaceWith(lastContent);
}

const getLoader = (path: string) => {
  const urlParts = path.split('/');

  let i = urlParts.length
  const baseLength = BASE_PATH.split('/').length

  while (i-- > baseLength) {
    const route = urlParts.slice(0, i).join('/') + '/';

    const match = Object.entries(loaders).find(([key, _]) => {
      if (isURLMatch(key, route)) {
        return true;
      }
      return false;
    })
    if (match) {
      return match[1]();
    }
  }
  return null;
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
    path = matchRoute(path) || BASE_PATH + '/404'
  }

  if (!routes[path]) {
    throw new Error('No route found.')
  }

  const component = await routes[path]()
  // const renderedComponent = VentaInternal.createComponent(component, {})
  renderPage(path, component)


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

