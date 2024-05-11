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
  const rendered: [string, HTMLElement][] = func().map(([key, renderFunc]) => [key, renderFunc()])
  let lastContent: (HTMLElement | Comment)[] = rendered.map(([_, elem]) => elem)

  let oldElementsMap = new Map<string, HTMLElement>(rendered);

  let parent: ParentNode;
  let parentListStartIndex: number;

  if (iterable instanceof VentaState) {

    iterable.addSideEffect(() => {
      if (!parent) {
        parent = lastContent[0].parentNode!;
        const childrenList = Array.from(parent.childNodes);
        parentListStartIndex = childrenList.indexOf(lastContent[0]);
      }

      const newContent: [any, () => HTMLElement][] = func();
      if (newContent.length === 0) {
        oldElementsMap.clear();


        let i = parent.childNodes.length;
        while (i--) {
          parent.removeChild(parent.lastChild);
        }


        lastContent = [document.createComment('venta-loop-anchor')];
        parent.insertBefore(lastContent[0], parent.childNodes[parentListStartIndex]);

        return
      }


      let newContentRendered: [string, HTMLElement][] = Array(newContent.length);
      const newContentKeys = new Set(newContent.map(([key, _]) => JSON.stringify(key)));

      const somethingGotDeleted = newContent.length < lastContent.length;
      const isSameLength = newContent.length === lastContent.length;

      const swapPairs = new Map<string, string>();


      let i = 0;
      let htmlChildIndex = 0
      while (i < newContent.length && htmlChildIndex < lastContent.length) {
        let elem: HTMLElement;
        const [key, renderFunc] = newContent[i];
        const oldElem = oldElementsMap.get(key);
        if (oldElem) {
          elem = oldElem;
          oldElementsMap.delete(key);
        }
        else {
          elem = renderFunc();
        }

        let parralell = lastContent[htmlChildIndex];
        while (
          somethingGotDeleted
          && !(parralell instanceof Comment)
          && !newContentKeys.has(parralell.getAttribute('key'))) {
          if (htmlChildIndex === lastContent.length) break;
          parralell = lastContent[++htmlChildIndex];
        }
        if (htmlChildIndex === lastContent.length) break;



        if (lastContent[htmlChildIndex] instanceof Comment) {
          parent.replaceChild(elem, parralell)
        }
        else {
          const parallelKey = (parralell as HTMLElement).getAttribute('key');
          if (parallelKey !== JSON.stringify(key)) {
            if (isSameLength) {
              // this hurts my head
              if (!swapPairs.get(key)) {
                swapPairs.set(parallelKey, key)
                if (htmlChildIndex === 0) {
                  lastContent[0].before(elem);
                }
                else {
                  lastContent[htmlChildIndex - 1].after(elem);
                }
              }
            } else {
              parralell.after(elem)
            }
          }
          //else it is the right spot
        }
        newContentRendered[i] = [key, elem];
        i++;
        htmlChildIndex++;
      }

      if (i < newContent.length) {
        while (i < newContent.length) {
          let elem: HTMLElement;
          const [key, renderFunc] = newContent[i];
          const oldElem = oldElementsMap.get(key);
          if (oldElem) {
            elem = oldElem;
            oldElementsMap.delete(key);
          }
          else {
            elem = renderFunc();
          }
          parent.appendChild(elem)
          newContentRendered[i] = [key, elem];
          i++;
        }
      }

      oldElementsMap.forEach((elem) => {
        elem.remove();
      });

      oldElementsMap = new Map([...newContentRendered]);
      lastContent = Array.from(oldElementsMap.values())
    });
  }
  if (!lastContent.length) {
    lastContent = [document.createComment('venta-loop-anchor')]
  }
  return lastContent
};
