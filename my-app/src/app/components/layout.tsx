import "../globals.css";
import { VentaNode } from "venta";

export function RootLayout({ children }: { children: VentaNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
