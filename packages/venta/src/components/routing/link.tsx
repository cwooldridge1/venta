export function Link(props: HTMLAnchorElement) {

  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    history.pushState({}, '', props.href)
    window.dispatchEvent(new CustomEvent('venta-link'));
  }

  return (
    <a {...props} onClick={handleClick}>{props.children}</a>
  )
}

export default Link
