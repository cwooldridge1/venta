import { VentaInternal } from "../internal";
import { VentaAppState } from "../state";

export function isServerEnvironment() {
  return typeof process !== 'undefined' && process.versions && process.versions.node;
}
export const getSharedState = () => {
  const isServer = isServerEnvironment();
  return {
    VentaInternal: isServer ? VentaInternal : window.VentaInternal,
    VentaAppState: isServer ? VentaAppState : window.VentaAppState
  }
}
