import { NodeTypes } from "../types";
import { VentaAppState } from "../state";
window.VentaAppState = VentaAppState;
import { VentaInternal } from "../internal";
window.VentaInternal = VentaInternal;

let lastElement: NodeTypes | undefined = undefined;

export const handleLocation = async () => {
  const path = window.location.pathname;
  const module = await import(`./${path}.js`);
  const component = module.default; // or whatever the exported component is named
  const root = document.getElementById("root")!;
  //now we need to clear the root element and append the new component
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

