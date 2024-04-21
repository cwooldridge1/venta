import type { VentaInternal } from "../internal";
import { VentaAppState } from "../state";


//the only reason this is here as it will be a nice abstraction if SSR is ever implemented
export const getSharedState = () => {
  return {
    VentaInternal: window.VentaInternal as typeof VentaInternal,
    VentaAppState: window.VentaAppState as typeof VentaAppState
  }
}
