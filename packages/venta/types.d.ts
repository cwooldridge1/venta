import { VentaInternal } from "./src/internal";
import { VentaAppState } from "./src/state";

export { }; // This line makes TypeScript treat this file as a module

declare global {
  // namespace JSX {
  //   interface Element extends VentaJSX.Element { }
  //   //interface IntrinsicElements extends VentaJSX.IntrinsicElements { }
  // }

  interface Window {
    VentaInternal: typeof VentaInternal;
    VentaAppState: typeof VentaAppState;
  }
}
