import Venta from '../../src/index.ts'

export function Link(props) {

  const handleClick = (e) => {
    e.preventDefault()
    history.pushState({}, '', props.href)
    window.dispatchEvent(new CustomEvent('venta-link'));
  }

  return (
    <a {...props} onClick={handleClick}>{props.children}</a>
  )
}
