export { }; // This line makes TypeScript treat this file as a module

declare global {
  namespace VentaJSX {
    interface Element extends HTMLElement { }
    interface IntrinsicElements {
      a: any; // Specify attributes as needed
      // Add other elements as necessary
    }
  }

  namespace JSX {
    interface Element extends VentaJSX.Element { }
    interface IntrinsicElements extends VentaJSX.IntrinsicElements { }
  }
}
