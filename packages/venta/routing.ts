import { NodeTypes } from "./src/types";
import { VentaAppState } from "./src/state";
window.VentaAppState = VentaAppState;
import { VentaInternal } from "./src/internal";
window.VentaInternal = VentaInternal;

let lastElement: NodeTypes | undefined = undefined;

export const handleLocation = async () => {
  console.log('handling location')
  const path = window.location.pathname;
  const module = await import(`./${path}.js` /* @vite-ignore */);

  const component = module.default;
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

