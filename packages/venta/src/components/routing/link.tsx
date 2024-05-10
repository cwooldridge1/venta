/// <reference path="../../index.d.ts" />

import { createElement } from "../../../src/utils";

export function Link({ children, href = '', ...rest }: Venta.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const handleClick = (event: Venta.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    history.pushState({}, '', href);
    window.dispatchEvent(new CustomEvent('venta-link'));
  };

  return createElement('a', { onClick: handleClick, ...rest }, children)
}

export default Link;

