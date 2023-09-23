import { Props, VentaState } from "./types";
import { renderConditional, registerConditional, renderVentaNode, render, renderTextNode } from "./utils/rendering";
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
    renderConditional: (
      test: () => boolean,
      contentIfTrue: (() => HTMLElement | Text),
      contentIfFalse: (() => HTMLElement | Text),
      id: number
    ) => HTMLElement | Text
    registerConditional: (
      test: () => boolean,
      contentIfTrue: (() => HTMLElement),
      contentIfFalse: (() => HTMLElement),
      ...deps: VentaState[]
    ) => HTMLElement | Text,
    renderTextNode: (state: VentaState | string) => Text
  }
}


// so babel can reference these functions
window.renderVentaNode = renderVentaNode
window.renderConditional = renderConditional
window.registerConditional = registerConditional
window.renderTextNode = renderTextNode 
