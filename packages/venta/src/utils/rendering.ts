import { VentaStateArray, VentaState, componentCounter } from '../state'
import { getSharedState } from './enviroment-helpers';
import { COMPONENT_ID_ATTRIBUTE } from '../constants'


export const createStatefulTextNode = (value: any, accessPaths: any[]) => {
  const textNode = document.createTextNode(value)
  let lastState: VentaState<any> | undefined = undefined;
  let i = accessPaths.length;
  while (i--) {
    if (accessPaths[i] instanceof VentaState) {
      lastState = accessPaths[i]
      lastState.addTextNode(textNode)
      break
    }
  }
  return textNode
}

export const createStatefulElement = (type: keyof HTMLElementTagNameMap, props: { [key: string]: any }, statefulProps: { [key: string]: any[] }, ...children: Venta.NodeTypes[]) => {
  const elem = createElement(type, props, ...children)

  Object.entries(statefulProps).forEach(([key, accessPaths]) => {
    let i = accessPaths.length;
    while (i--) {
      if (accessPaths[i] instanceof VentaState) {
        const state = accessPaths[i]
        state.addElementAttribute(key, elem)
        break;
      }
    }
  })

  return elem
}

export const createComponent = <P>(component: Venta.ComponentType, props: P, children?: Venta.NodeTypes[]) => {
  const elem = component(children ? { ...props, children } : props)
  if (elem instanceof HTMLElement) {
    elem[COMPONENT_ID_ATTRIBUTE] = componentCounter.getCount()
  } else {
    getSharedState().VentaAppState.elementToComponentId.set(elem as Node, componentCounter.getCount())
  }
  componentCounter.increment()
  return elem
}


export const createElement = (type: keyof HTMLElementTagNameMap,
  props: { [key: string]: any },
  ...children: Venta.VentaNode[]) => {

  const elem = document.createElement(type)



  for (let [key, value] of Object.entries(props || {})) {
    if (key.startsWith('on')) {
      if (key === 'onChange') {
        key = 'onInput'
      }
      const eventName = key.substring(2).toLowerCase();
      elem.addEventListener(eventName, value);
    }
    else {
      elem.setAttribute(key, value);
    }
  }

  const appendChild = (child: any) => {

    if (typeof child === "string" || typeof child === "number") {
      elem.appendChild(document.createTextNode(child.toString()));
    }
    else if (Array.isArray(child)) {
      child.forEach(appendChild)
    }
    else {
      elem.appendChild(child);
    }
  }

  children.forEach(appendChild)

  return elem;
}


export const createAnchor = (meta: string) => {
  const anchor: Venta.NodeTypes = document.createComment(meta)
  return anchor
}


const cache = new Map<string, Venta.NodeTypes>();
const inverseCache = new Map<Venta.NodeTypes, string>();

let callCount = 0;
/*
 * This function is used when there is condtional renders inside of a conditional. It essentially just determins what to render and returns that
 * contentIfTrue and contentIfFalse can be this function or a function that returns the html
 * */
export const renderConditional = (
  test: () => boolean,
  contentIfTrue: () => Venta.NodeTypes,
  contentIfFalse: () => Venta.NodeTypes,
  id: number
): Venta.NodeTypes => {
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
    inverseCache.set(content, key)
  }

  return content;
};


export const registerConditional = (
  test: () => any,
  contentIfTrue: (() => Venta.NodeTypes),
  contentIfFalse: (() => Venta.NodeTypes),
  ...deps: Array<VentaState<any> | any>
): Venta.NodeTypes => {
  let lastContent: Venta.NodeTypes;
  let localCache = new Map<boolean, Venta.NodeTypes>();

  const onChange = () => {
    let testValue = test()
    let content = localCache.get(testValue)
    if (!content) {
      const lastCount = callCount
      content = testValue ? contentIfTrue() : contentIfFalse()
      if (callCount === lastCount) { // this means it was a direct html element or a component that got rendered
        localCache.set(testValue, content)
      }
    }

    if (content === lastContent) {
      return
    }
    localCache.delete(!testValue)


    lastContent.replaceWith(content)
    lastContent = content;
  }

  deps.forEach(dep => {
    if (!(dep instanceof VentaState)) return; // this is our filter as the compiler attaches all related variables
    dep.addSideEffect(onChange)
  })
  let testValue = test()
  const lastCount = callCount
  lastContent = testValue ? contentIfTrue() : contentIfFalse();
  if (callCount === lastCount) { // this means that what was rendered was an html element or a component
    localCache.set(testValue, lastContent)
  }



  return lastContent;
};


export const renderLoop = <T>(func: (item: T) => HTMLElement, iterable: T[] | VentaStateArray<T> | VentaState<T[]>) => {

  if (iterable instanceof VentaStateArray) {
    const content: (Comment | HTMLElement)[] = [document.createComment('venta-loop-anchor-start'), document.createComment('venta-loop-anchor-end')]

    content.splice(1, 0, ...iterable.value.map(func))
    iterable.addHTMLSideEffect(content[0] as Comment, content[content.length - 1] as Comment, func)
    return content
  }
  if (iterable instanceof VentaState) {
    console.warn('You are using a VentaState as the iterable in a renderLoop. This is not not optimized and state changes will not be reflected in DOM. Please use a VentaStateArray instead.')
    return iterable.value.map(func)
  }

  return iterable.map(func)
};


