import { VentaState, VentaNode } from "./types";

let globalId = 0;

export const getGlobalId = () => globalId;

export const incrementGlobalId = () => {
  globalId += 1;
};
export const stateMap = new Map<number, VentaState>();
export const elementMap = new Map<HTMLElement, VentaNode>();
