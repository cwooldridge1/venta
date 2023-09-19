import { elementMap, stateMap } from "../state"
import { Props, VentaNode, VentaState } from "../types"
import { componentReferenceMap, getComponentId, incrementComponentId, componentStateMap } from "../state"


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
    componentStateMap.set(getComponentId(), { state: [], unmountCallbacks: [] })
    const component = type({ ...props, children: children.length > 1 ? children : !children.length ? null : children[0] })
    componentReferenceMap.set(component, getComponentId())
    incrementComponentId()
    return component
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
  elementMap.set(elem, stateRef)
  dependentStates.forEach(state => state.elements.push(elem))

  return elem;
}


export const render = (component: any, props: Props, parent: HTMLElement) => {
  parent.innerHTML = '';
  parent.appendChild(component(props));
}



type Content = (() => HTMLElement)


const cache = new Map<string, HTMLElement>();

let callCount = 0;
/*
 * This function is used when there is condtional renders inside of a conditional. It essentially just determins what to render and returns that
 * contentIfTrue and contentIfFalse can be this function or a function that returns the html
 * */
export const renderConditional = (
  test: () => boolean,
  contentIfTrue: Content,
  contentIfFalse: Content,
  id: number
): HTMLElement => {
  const testValue = test();
  const key = `${id}-${testValue}`

  callCount++;
  const cacheVal = cache.get(key)
  if (cacheVal) {
    return cacheVal
  }
  const currentCallCount = callCount;
  const content = testValue ? contentIfTrue() : contentIfFalse();
  if (callCount === currentCallCount) { // this is a very hacky way to see if the base case is met of not rendering another conditional
    cache.set(key, content)
  }

  return content;
};


const handleComponentUnmount = (componentId: number, element: HTMLElement) => {
  const { state, unmountCallbacks } = componentStateMap.get(componentId)!
  state.forEach(state => {
    state.elements.forEach(elem => elementMap.delete(elem))
    stateMap.delete(state.id)
  })
  unmountCallbacks.forEach(callback => callback())
  //we also need to remove it from component cache as we want it to rerender when mounted
  cache.forEach((val, key) => {
    if (val === element) {
      cache.delete(key)
    }
  })
  componentStateMap.delete(componentId)

}

export const registerConditional = (
  test: () => boolean,
  contentIfTrue: Content,
  contentIfFalse: Content,
  ...deps: VentaState[]
) => {
  let lastContent: HTMLElement;
  let localCache = new Map<boolean, HTMLElement>();


  deps.forEach(dep => {
    dep.conditionalElements.push(() => {
      let testValue = test()
      let content = localCache.get(testValue)
      if (!content) {
        const lastCount = callCount
        content = testValue ? contentIfTrue() : contentIfFalse()
        if (callCount === lastCount) {
          localCache.set(testValue, content)
        }
      }

      if (content === lastContent) {
        return
      }
      localCache.delete(!testValue)

      //remove all dependencies that referenece this state
      deps.forEach((dep) => {
        const targetIndex = dep.elements.indexOf(lastContent)
        if (targetIndex !== -1) {
          dep.elements.splice(targetIndex, 1)
        }
      })
      const componentId = componentReferenceMap.get(lastContent)
      if (componentId !== undefined) {
        handleComponentUnmount(componentId, lastContent)
      }
      elementMap.delete(lastContent)
      lastContent.replaceWith(content)
      lastContent = content;
    })
  })
  lastContent = test() ? contentIfTrue() : contentIfFalse();

  return lastContent;
};

