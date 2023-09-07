let globalId = 0
const componentState = new Map();
const stateMap = new Map();
const elementMap = new Map();

const renderJSX = (type, props, ...children) => {
  if (typeof type === 'function') {
    return type({ ...props, children: children.length > 1 ? children : !children.length ? null : children[0] })
  }
  const elem = document.createElement(type);
  const stateRef = { element: elem, attributeState: {}, childState: {} }

  for (let [key, value] of Object.entries(props || {})) {
    if (key.startsWith('on')) {
      const eventName = key.substring(2).toLowerCase();
      elem.addEventListener(eventName, value);
    } else {
      if (typeof value === 'object') {
        elem.setAttribute(key, value.state);
        if (stateRef.attributeState[value.id] === undefined) stateRef.attributeState[value.id] = []
        stateRef.attributeState[value.id].push([key, value])
      } else {
        elem.setAttribute(key, value);
      }
    }
  }
  const renderChild = (child, index) => {
    if (Array.isArray(child)) {
      child.forEach(renderChild)
      return
    }
    if (typeof child === "string" || typeof child === "number") {
      elem.appendChild(document.createTextNode(child));
      return
    }
    if (child instanceof HTMLElement) {
      elem.appendChild(child);
      return;
    }
    if (typeof child === 'object') {
      const state = stateMap.get(child.id)
      state.elements.push(elem)
      elem.appendChild(document.createTextNode(child.state));
      if (stateRef.childState[child.id] === undefined) stateRef.childState[child.id] = []
      stateRef.childState[child.id].push([index, child])
    }
  }

  children.forEach(renderChild);

  if (Object.keys(stateRef.attributeState) || Object.keys(stateRef.childState.keys())) {
    elementMap.set(elem, stateRef)
  }

  return elem;
}
window.renderJSX = renderJSX


export const render = (component, props, parent) => {
  const state = componentState.get(parent) || { cache: [] };
  componentState.set(parent, { ...state, component, props });
  globalId = 0;
  parent.innerHTML = '';
  parent.appendChild(component(props));
}

const updateNode = (elem, stateIndex) => {
  const { attributeState, childState } = elementMap.get(elem)
  console.log(attributeState, childState)
  attributeState[stateIndex].forEach(([key, value]) => {
    elem.setAttribute(key, value.state)
  })
  childState[stateIndex].forEach(([index, value]) => {
    elem.childNodes[index].textContent = value.state
  })
}

export const useState = (initialValue) => {
  const id = globalId++;
  return (() => {
    const setState = (newValue) => {
      let state = stateMap.get(id)
      const { sideEffects, elements } = state
      state.state = newValue
      sideEffects.forEach(sideEffect => sideEffect());
      elements.forEach(node => updateNode(node, state.id))
    }

    stateMap.set(id, { sideEffects: [], elements: [], state: initialValue, setState: setState, id: id });

    return stateMap.get(id)
  })()
}






