import { createDeletionObserver } from "./utils/observers";
import { renderConditional, createComponent, registerConditional, createElement, createStatefulElement, createStatefulTextNode, renderLoop, createAnchor } from "./utils/rendering";

export const VentaInternal = {
  createDeletionObserver,
  renderConditional,
  registerConditional,
  createElement,
  createStatefulTextNode,
  createStatefulElement,
  createComponent,
  renderLoop,
  createAnchor,
}
