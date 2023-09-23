import { VentaState, VentaNode } from "./types";

let globalId = 0;

export const getGlobalId = () => globalId;

export const incrementGlobalId = () => {
  globalId += 1;
};


let componentId = 0;

export const getComponentId = () => componentId;

export const incrementComponentId = () => {
  componentId += 1;
};

export const componentReferenceMap = new Map<HTMLElement | Text, number>();
export const componentStateMap = new Map<number, { state: VentaState[], unmountCallbacks: Function[] }>();
export const stateMap = new Map<number, VentaState>();
export const elementMap = new Map<HTMLElement | Text, VentaNode>();
