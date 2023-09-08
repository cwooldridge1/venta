import { Props } from "./types";
import { renderVentaNode } from "./utils/rendering";
export { render } from "./utils/rendering"
export * from './hooks'
export * from './types'




//this is a hack to make jsx work with typescript
declare global {
  interface Window {
    renderVentaNode: (type: any, props: Props, ...children: any[]) => HTMLElement;
  }
}

window.renderVentaNode = renderVentaNode // so babel can compile jsx



