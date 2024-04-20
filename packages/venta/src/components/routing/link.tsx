/// <reference path="../../../types.d.ts" />

export function Link(props: VentaJSX.IntrinsicElements['a']) {
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    history.pushState({}, '', props.href);
    window.dispatchEvent(new CustomEvent('venta-link'));
  };

  return (
    <a {...props} onClick={handleClick}>{props.children}</a>
  );
}

export default Link;

