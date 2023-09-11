import { elementMap, stateMap } from "../state"
import { Props, VentaNode, VentaState } from "../types"

export const updateNode = (elem: HTMLElement, stateIndex: number) => {
  const elementState = elementMap.get(elem)
  if (!elementState) throw new Error('element state not found')
  const { attributeState, childState } = elementState
  attributeState[stateIndex]?.forEach(([key, value]) => {
    elem.setAttribute(key, value.value)
  })
  childState[stateIndex]?.forEach(([index, value]) => {
    elem.childNodes[index].textContent = value.value
  })
}

export const renderVentaNode = (type: any, props: Props, ...children: any[]) => {
  if (typeof type === 'function') {
    return type({ ...props, children: children.length > 1 ? children : !children.length ? null : children[0] })
  }
  const elem = document.createElement(type);
  const stateRef: VentaNode = { element: elem, attributeState: {}, childState: {} }
  const dependentStates = new Set<VentaState>();

  for (let [key, value] of Object.entries(props || {})) {
    if (key.startsWith('on')) {
      const eventName = key.substring(2).toLowerCase();
      elem.addEventListener(eventName, value);
    } else {
      if (typeof value === 'object' && value) {
        dependentStates.add(value)
        elem.setAttribute(key, value.state);
        if (stateRef.attributeState[value.id] === undefined) stateRef.attributeState[value.id] = []
        stateRef.attributeState[value.id].push([key, value])
      } else {
        elem.setAttribute(key, value);
      }
    }
  }
  const renderChild = (child: any, index: number) => {
    if (Array.isArray(child)) {
      child.forEach(renderChild)
      return
    }
    if (typeof child === "string" || typeof child === "number") {
      elem.appendChild(document.createTextNode(child.toString()));
      return
    }
    if (child instanceof HTMLElement) {
      elem.appendChild(child);
      return;
    }
    if (typeof child === 'object') {
      const state = stateMap.get(child.id)
      if (!state) throw new Error('state not found')
      dependentStates.add(state)
      elem.appendChild(document.createTextNode(child.value));
      if (stateRef.childState[child.id] === undefined) stateRef.childState[child.id] = []
      stateRef.childState[child.id].push([index, child])
    }
  }

  children.forEach(renderChild);
  if (Object.keys(stateRef.attributeState).length > 0 || Object.keys(stateRef.childState).length > 0) {
    elementMap.set(elem, stateRef)
    dependentStates.forEach(state => state.elements.push(elem))
  }

  return elem;

}



export const render = (component: any, props: Props, parent: HTMLElement) => {
  parent.innerHTML = '';
  parent.appendChild(component(props));
}

export const renderReactiveConditional = (
  test: () => boolean,
  contentIfTrue: any,
  contentIfFalse: any,
  parent: any,
  ...deps: VentaState[]
) => {
  let lastTestValue: undefined | boolean = undefined

  deps.forEach(dep => {
    dep.conditionalElements.push(() => {
      let testValue = test()
      if (testValue != lastTestValue) { // only update if we need to 
        const parentElement = document.querySelector(`[ventanodeid=${parent}`)
        if (parentElement?.lastElementChild) {
          parentElement.removeChild(parentElement.lastElementChild);
        }
        parentElement?.appendChild(test() ? contentIfTrue : contentIfFalse)
      }
    })
  })

  return test() ? contentIfTrue : contentIfFalse;
};


