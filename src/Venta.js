let globalId = 0
const componentState = new Map();
let globalParent;

const renderJSX = (type, props, ...children) => {
  const elem = document.createElement(type);

  for (let [key, value] of Object.entries(props || {})) {
    if (key.startsWith('on')) {
      // Remove 'on' and convert to lowercase to get the event name, e.g., 'onClick' -> 'click'
      const eventName = key.substring(2).toLowerCase();
      elem.addEventListener(eventName, value);
    } else {
      elem.setAttribute(key, value);
    }
  }

  children.forEach(child => {
    if (typeof child === "string" || typeof child === "number") {
      elem.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      elem.appendChild(child);
    }
  });

  return elem;
}
window.renderJSX = renderJSX


export const render = (component, props, parent) => {
  const state = componentState.get(parent) || { cache: [] };
  componentState.set(parent, { ...state, component, props });
  globalId = 0;
  globalParent = parent
  parent.innerHTML = '';
  parent.appendChild(component(props));
}


export const useState = (initialValue) => {
  const id = globalId;
  globalId++;
  const parent = globalParent;
  return (() => {
    const { cache } = componentState.get(parent);
    if (cache[id] == null) {
      cache[id] = {
        value: typeof initialValue === 'function' ? initialValue() : initialValue
      }
    }

    const setState = (newValue) => {
      const { cache, props, component } = componentState.get(parent);
      if (typeof newValue === 'function') {
        cache[id].value = newValue(cache[id].value)
      } else {
        cache[id].value = newValue
      }
      render(component, props, parent)
    }

    return [cache[id].value, setState]
  })()
}


export const useEffect = (callback, dependencies) => {

  const id = globalId;
  const parent = globalParent;
  globalId++;
  (() => {
    const { cache } = componentState.get(parent);
    if (cache[id] == null) {
      cache[id] = {
        dependencies: undefined,
      }
    }
    const dependenciesChanged = cache[id].dependencies === undefined || dependencies == null || dependencies.some((dependency, index) => {
      return cache[id].dependencies == null || cache[id].dependencies[index] !== dependency
    })

    if (dependenciesChanged) {
      if (cache[id].cleanup != null) cache[id].cleanup()
      cache[id].cleanup = callback()
      cache[id].dependencies = dependencies
    }
  })()
}



export const useMemo = (callback, dependencies) => {

  const id = globalId;
  globalId++;
  const parent = globalParent;
  return (() => {
    const { cache } = componentState.get(parent);
    if (cache[id] == null) {
      cache[id] = {
        dependencies: [],
      }
    }
    const dependenciesChanged = cache[id].dependencies === undefined || dependencies === null || dependencies.some((dependency, index) => {
      return cache[id].dependencies === null || cache[id].dependencies[index] !== dependency
    })

    if (dependenciesChanged) {
      cache[id].memo = callback()
      cache[id].dependencies = dependencies
    }
    return cache[id].memo
  })()
}
