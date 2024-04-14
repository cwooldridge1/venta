import { renderConditional, registerConditional, renderVentaNode, render, renderTextNode, renderFineTunedResponsiveNode, renderLoop, createAnchor } from "./utils/rendering";
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
  renderTextNode,
  renderLoop,
  createAnchor,
  renderFineTunedResponsiveNode
};

export default Venta;
