import "../globals.css";
import { useEffect } from "venta";

export function RootLayout({ children }: { children: Venta.VentaNode }) {

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
