/// <reference types="vite/client" />
import { VentaAppState } from "venta/src/state";
window.VentaAppState = VentaAppState;
import { VentaInternal } from "venta/src/internal";
window.VentaInternal = VentaInternal;
import.meta.glob('/assets/**/*') // this is needed so the assets are copied to the dist folder

const BASE_PATH = import.meta.env.BASE_URL;

let lastElement: Venta.NodeTypes | undefined = undefined;

const modules = import.meta.glob('/**/page.{jsx,tsx,ts,js}',
  {
    import: 'default'
  }
) // this is generated at compile time - the / defaults to an alias see https://vitejs.dev/guide/features#glob-import-caveats


const getRoutes = () => {
  return Object.fromEntries(Object.entries(modules).map(([key, value]) => {
    const baseRoute = key.replace('/src/app/', '')
    const routeParts = baseRoute.split('/')
    routeParts.pop()
    const route = routeParts.join('')
    return [BASE_PATH + route, value]
  })) as { [key: string]: () => Promise<any> }
}

const routes = getRoutes()


export const handleLocation = async () => {
  let path = window.location.pathname;
  if (path.endsWith('/index.html')) {
    path = path.substring(0, path.length - '/index.html'.length)
  }
  const component = await routes[path]()

  const root = document.getElementById("root")!;
  if (lastElement) {
    VentaInternal.handleUnmountElement(lastElement, false)
  }

  let newElement = VentaInternal.createComponent(component, {});

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

