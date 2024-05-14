import { VentaState, componentCounter } from '../state'
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

export const createComponent = <P>(component: Venta.ComponentType, props: P) => {
  const elem = component(props)
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
  contentIfTrue: (() => HTMLElement | Text),
  contentIfFalse: (() => HTMLElement | Text),
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



/*
* render loop is used for rendering a list of elements. It will keep track of the elements and update them as needed
* @param func: a function that returns an array of html elements
* @param iterable: is the itterable that the func is based off of 
 */
export const renderLoop = (func: () => [any, () => HTMLElement][], iterable: VentaState<any[]> | any[]) => {

  // set state = fresh diff 
  //
  const rendered: [string, HTMLElement][] = func().map(([key, renderFunc]) => [key, renderFunc()])
  let lastContent: (HTMLElement | Comment)[] = rendered.map(([_, elem]) => elem)

  let parent: ParentNode;
  let parentListStartIndex: number;

  if (iterable instanceof VentaState) {

    // const originalSlice = Array.prototype.slice;

    iterable.value.push = (...values) => {
      if (!parent) {
        parent = lastContent[0].parentNode!;
        const childrenList = Array.from(parent.childNodes);
        parentListStartIndex = childrenList.indexOf(lastContent[0]);
      }
      Array.prototype.push.call(iterable.value, ...values)
      const newContent: [any, () => HTMLElement][] = func();
      for (let i = 0; i < newContent.length; i++) {
        const elem = newContent[i][1]()
        parent.appendChild(elem)
        lastContent.push(elem)
      }
    }
    iterable.addSideEffect(() => {


      iterable.value.splice = (index, deleteCount, ...items) => {
        // Call original splice method to handle the array updates
        Array.prototype.splice.apply(iterable.value, [index, deleteCount, ...items]);

        // Remove elements from the DOM
        for (let i = 0; i < deleteCount; i++) {
          if (lastContent[index]) {
            parent.removeChild(lastContent[index]);
            lastContent.splice(index, 1);
          }
        }

        // Generate new content based on the updated array
        const temp = iterable.value;
        iterable.value = items
        const newContent = func(); // Assuming func() returns an array of [any, () => HTMLElement]
        iterable.value = temp;

        // Insert new DOM elements
        for (let i = 0; i < newContent.length; i++) {
          const elementFactory = newContent[i][1];
          const elem = elementFactory();
          const insertBeforeNode = lastContent[index] || null;
          parent.insertBefore(elem, insertBeforeNode);
          lastContent.splice(index + i, 0, elem);
        }
      };

      iterable.value.push = (...values) => {
        Array.prototype.push.call(iterable.value, ...values)
        const newContent: [any, () => HTMLElement][] = func();
        for (let i = lastContent.length; i < newContent.length; i++) {
          const elem = newContent[i][1]()
          parent.appendChild(elem)
          lastContent.push(elem)
        }
      }
      if (!parent) {
        parent = lastContent[0].parentNode!;
        const childrenList = Array.from(parent.childNodes);
        parentListStartIndex = childrenList.indexOf(lastContent[0]);
      }

      const newContent: [any, () => HTMLElement][] = func();


      let i = 0
      const lastContentLength = lastContent.length
      const newContentLength = newContent.length
      const frag = document.createDocumentFragment();
      const newRenderedContent = new Array(newContentLength)
      while (i < newContentLength) {
        let elem: HTMLElement;
        const renderFunc = newContent[i][1];

        elem = renderFunc();
        if (i < lastContentLength) {
          lastContent[i].remove()
        }
        frag.appendChild(elem)
        newRenderedContent[i] = elem
        i++;
      }
      parent.appendChild(frag);
      while (i < lastContentLength) {
        parent.removeChild(lastContent[i])
        i++
      }
      lastContent = newRenderedContent;
    });
  }
  if (!lastContent.length) {
    lastContent = [document.createComment('venta-loop-anchor')]
  }
  return lastContent
};
