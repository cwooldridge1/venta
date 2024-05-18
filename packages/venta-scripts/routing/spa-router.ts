/// <reference types="vite/client" />
import { VentaAppState } from "venta/src/state";
window.VentaAppState = VentaAppState;
import { VentaInternal } from "venta/src/internal";
import { createDeletionObserver } from "venta/src/utils/observers";
window.VentaInternal = VentaInternal;
import.meta.glob('/assets/**/*') // this is needed so the assets are copied to the dist folder

const BASE_PATH = import.meta.env.BASE_URL;

let lastElement: Venta.NodeTypes | undefined = undefined;

const modules = import.meta.glob('/**/page.{jsx,tsx,ts,js}',
  {
    import: 'default'
  }
) // this is generated at compile time - the / defaults to an alias see https://vitejs.dev/guide/features#glob-import-caveats


const getRoutes = (): { [key: string]: () => Promise<any> } => {
  console.log(modules)
  return Object.fromEntries(Object.entries(modules).map(([key, value]) => {
    const baseRoute = key.replace('/src/app/', '')
    const routeParts = baseRoute.split('/')
    routeParts.pop()
    const route = routeParts.join('/')
    return [BASE_PATH + '/' + route, value]
  }))
}

const routes = getRoutes()

const isURLMatch = (route: string, url: string) => {
  const routeParts = route.split('/').filter(Boolean);
  const urlParts = url.split('/').filter(Boolean);

  if (routeParts.length !== urlParts.length) {
    return false;
  }


  for (let i = 0; i < routeParts.length; i++) {
    const routePart = routeParts[i];
    const urlPart = urlParts[i];

    if (routePart.startsWith('[') && routePart.endsWith(']')) {
    } else if (routePart !== urlPart) {
      return false;
    }
  }

  return true;
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
  if (path.endsWith('/index.html')) {
    path = path.substring(0, path.length - '/index.html'.length)
  }
  console.log(routes)
  if (!routes[path]) {
    path = matchRoute(path) || '/404'
  }

  const component = await routes[path]()

  const root = document.getElementById("root")!;

  let newElement = VentaInternal.createComponent(component, {});

  const config = { childList: true, subtree: true }
  if (VentaAppState.componentCleanUpMap.size > 0) {
    deletionObserver.disconnect();
    deletionObserver.observe(root, config);
  }

  if (lastElement) {
    lastElement.replaceWith(newElement);
  }
  else {
    root.appendChild(newElement);
  }
  lastElement = newElement;
};

window.onpopstate = handleLocation;
window.addEventListener('venta-link', function() {
  handleLocation();
});

handleLocation();

