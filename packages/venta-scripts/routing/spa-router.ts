/// <reference types="vite/client" />
import { VentaAppState } from "venta/src/state";
window.VentaAppState = VentaAppState;
import { VentaInternal } from "venta/src/internal";
import { COMPONENT_ID_ATTRIBUTE } from "../constants";
import { getSharedState } from "venta/src/utils/enviroment-helpers";
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


// Create an observer instance
const deletionObserver = new MutationObserver(mutations => {
  const { componentCleanUpMap, elementToComponentId } = getSharedState().VentaAppState
  console.log(componentCleanUpMap, elementToComponentId)
  mutations.forEach(mutation => {
    if (mutation.removedNodes.length) {
      mutation.removedNodes.forEach(removedNode => {
        if (removedNode instanceof HTMLElement) {
          let id = removedNode[COMPONENT_ID_ATTRIBUTE]
          if (id) {
            id = parseInt(id);
            const cleanUpFunctions = componentCleanUpMap.get(id);
            cleanUpFunctions.forEach(func => func())
            componentCleanUpMap.delete(id)
          }
        }
        else {
          const id = elementToComponentId.get(removedNode);
          if (id) {
            const cleanUpFunctions = componentCleanUpMap.get(id);
            cleanUpFunctions.forEach(func => func())
            elementToComponentId.delete(removedNode)
            componentCleanUpMap.delete(id)
          }
        }
      });
    }
  });
});



export const handleLocation = async () => {
  let path = window.location.pathname;
  if (path.endsWith('/index.html')) {
    path = path.substring(0, path.length - '/index.html'.length)
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

