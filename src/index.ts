import { Props } from "./types";
import { renderConditional, registerConditional, renderVentaNode, render } from "./utils/rendering";
import { useState, useEffect, useMemo } from './hooks';
export * from './types';

export { render, renderConditional, registerConditional, renderVentaNode };
export { useState, useEffect, useMemo };

const Venta = {
  render,
  useState,
  useEffect,
  useMemo,
  renderConditional,
  registerConditional,
  renderVentaNode,
};

export default Venta;

//this is a hack to make jsx work with typescript
declare global {
  interface Window {
    renderVentaNode: (type: any, props: Props, ...children: any[]) => HTMLElement;
    renderConditional: any;
    registerConditional: any;
  }
}

window.renderVentaNode = renderVentaNode // so babel can compile jsx
window.renderConditional = renderConditional
window.registerConditional = registerConditional
