import { NodeTypes } from "./src/types";
import { VentaAppState } from "./src/state";
window.VentaAppState = VentaAppState;
import { VentaInternal } from "./src/internal";
window.VentaInternal = VentaInternal;

let lastElement: NodeTypes | undefined = undefined;

const modules = import.meta.glob('../../src/app/**/page.jsx',
  { import: 'default' }
) // this is generated at compile time


const getRoutes = () => {
  return Object.fromEntries(Object.entries(modules).map(([key, value]) => {
    const baseRoute = key.replace('../../src/app/', '')
    const routeParts = baseRoute.split('/')
    routeParts.pop()
    const route = routeParts.join('')
    return ['/'.concat(route), value]
  })) as { [key: string]: () => Promise<any> }
}

const routes = getRoutes()


export const handleLocation = async () => {
  const path = window.location.pathname;
  const component = await routes[path]()

  const root = document.getElementById("root")!;
  if (lastElement) {
    VentaInternal.handleUnmountElement(lastElement, false)
  }

  let newElement = VentaInternal.renderVentaNode(component, {});

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

