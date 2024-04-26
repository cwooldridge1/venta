/// <reference path="../../index.d.ts" />

export function Link(props: Venta.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const handleClick = (event: Venta.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    history.pushState({}, '', props.href);
    window.dispatchEvent(new CustomEvent('venta-link'));
  };

  return (
    <a {...props} onClick={handleClick}>{props.children}</a>
  );
}

export default Link;

