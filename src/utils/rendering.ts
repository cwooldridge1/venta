import { conditionalMap, conditionalReferenceMap, elementMap, getConditionalId, incrementConditionalId, stateMap } from "../state"
import { Props, VentaNode, VentaState } from "../types"
import { componentReferenceMap, getComponentId, incrementComponentId, componentStateMap } from "../state"

export const renderTextNode = (value: VentaState | string) => {
  let node;

  if (value instanceof VentaState) {
    node = document.createTextNode(value.value)
    value.addElement(node)
    const stateRef: VentaNode = { element: node, attributeState: {}, childState: {} }
    stateRef.childState[value.getId()] = []
    stateRef.childState[value.getId()].push([0, value])
    elementMap.set(node, stateRef)
  }
  else {
    node = document.createTextNode(value)
    const stateRef: VentaNode = { element: node, attributeState: {}, childState: {} }
    elementMap.set(node, stateRef)
  }

  return node
}

export const renderVentaNode = (type: any, props: Props, ...children: any[]) => {
  if (typeof type === 'function') {
    incrementComponentId()
    componentStateMap.set(getComponentId(), { state: [], unmountCallbacks: [] })
    const component = type({ ...props, children: children.length > 1 ? children : !children.length ? null : children[0] })
    componentReferenceMap.set(component, getComponentId())
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
      if (value instanceof VentaState) {
        dependentStates.add(value)
        elem.setAttribute(key, value.value);
        if (stateRef.attributeState[value.getId()] === undefined) stateRef.attributeState[value.getId()] = []
        stateRef.attributeState[value.getId()].push([key, value])
      } else {
        elem.setAttribute(key, value);
      }
    }
  }
  const renderChild = (child: any, index: number) => {
    if (child === null || child === undefined) return
    if (Array.isArray(child)) {
      child.forEach(renderChild)
      return
    }
    if (typeof child === "string" || typeof child === "number") {
      elem.appendChild(document.createTextNode(child.toString()));
      return
    }
    if (child instanceof HTMLElement || child.nodeType) {
      elem.appendChild(child);
      return;
    }
    if (child instanceof VentaState) {
      const state = stateMap.get(child.getId())
      if (!state) throw new Error('state not found')
      dependentStates.add(state)
      elem.appendChild(document.createTextNode(child.value));
      if (stateRef.childState[child.getId()] === undefined) stateRef.childState[child.getId()] = []
      stateRef.childState[child.getId()].push([index, child])
    }
  }

  children.forEach(renderChild);
  elementMap.set(elem, stateRef)
  dependentStates.forEach(state => state.addElement(elem))

  return elem;
}


export const render = (component: any, props: Props, parent: HTMLElement) => {
  parent.innerHTML = '';
  parent.appendChild(component(props));
}



const cache = new Map<string, HTMLElement | Text>();
const inverseCache = new Map<HTMLElement | Text, string>();

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
): HTMLElement | Text => {
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


const handleComponentUnmount = (componentId: number, element: HTMLElement | Text) => {
  const { state, unmountCallbacks } = componentStateMap.get(componentId)!
  state.forEach(state => state.destroy())
  unmountCallbacks.forEach(callback => callback())
  //we also need to remove it from component cache as we want it to rerender when mounted
  const cacheKey = inverseCache.get(element)
  if (cacheKey) {
    inverseCache.delete(element)
    cache.delete(cacheKey)
  }
  componentStateMap.delete(componentId)
}

const handleUnmountConditional = (element: HTMLElement | Text) => {
  const conditionalId = conditionalReferenceMap.get(element)
  if (!conditionalId) return
  const cleanUp = conditionalMap.get(conditionalId)
  if (cleanUp) cleanUp()
  conditionalMap.delete(conditionalId)
  conditionalReferenceMap.delete(element)
}

const handleUnmountElement = (element: HTMLElement | Text) => {
  const componentId = componentReferenceMap.get(element)
  if (componentId !== undefined) {
    handleComponentUnmount(componentId, element)
  }
  handleUnmountConditional(element)

  //all states that reference this element need to be removed
  const stateRef = elementMap.get(element)
  if (stateRef) {
    for (const key in stateRef.attributeState) {
      stateRef.attributeState[key].forEach(([_, state]) => {
        state.deleteElement(element)
      })
    }
    for (const key in stateRef.childState) {
      stateRef.childState[key].forEach(([_, state]) => {
        state.deleteElement(element)
      })
    }
  }
  elementMap.delete(element)
  if (element instanceof HTMLElement) {
    const children = Array.from(element.children)
    children.forEach((node) => {
      handleUnmountElement(node as HTMLElement)
    })
  }
  element.remove()
}

export const registerConditional = (
  test: () => boolean,
  contentIfTrue: (() => HTMLElement | Text),
  contentIfFalse: (() => HTMLElement | Text),
  ...deps: Array<VentaState | any>
): HTMLElement | Text => {
  const id = getConditionalId();
  let lastContent: HTMLElement | Text;
  let localCache = new Map<boolean, HTMLElement | Text>();

  const handleNodeDeletion = (elem: HTMLElement | Text) => {
    const componentId = componentReferenceMap.get(elem)
    if (componentId !== undefined) {
      handleComponentUnmount(componentId, elem)
    }
    elementMap.delete(elem)
    componentReferenceMap.delete(elem)

    const conditionalId = conditionalReferenceMap.get(elem)
    if (conditionalId !== undefined && elem !== lastContent) { // we do this additional check because sometimes we delete nested nodes and those may be condtional elements
      const cleanUp = conditionalMap.get(conditionalId)
      if (cleanUp) cleanUp()
    }
  }

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

    //remove all dependencies that referenece this state
    deps.forEach((dep) => {
      if (dep instanceof VentaState) {
        dep.deleteElement(lastContent)
      }
    })
    // we also need to do the above for all nested components
    handleNodeDeletion(lastContent)

    if (lastContent instanceof Element) {
      const children = Array.from(lastContent.children) //this is needed for reference as in the case order changes I cannot refference the current parent
      children.forEach((node) => {
        handleNodeDeletion(node as HTMLElement)
      })
    }
    //we have to clean up the conditional unmounts
    conditionalReferenceMap.delete(lastContent)
    conditionalReferenceMap.set(content, id)

    lastContent.replaceWith(content)
    lastContent = content;
  }

  const cleanUp = () => {
    deps.forEach(dep => {
      if (!(dep instanceof VentaState)) return; // this is our filter as the compiler attaches all related variables
      dep.getSideEffects().delete(onChange)
    })
    conditionalMap.delete(id)
    conditionalReferenceMap.delete(lastContent)
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


  conditionalReferenceMap.set(lastContent, id)
  conditionalMap.set(id, cleanUp)

  incrementConditionalId()
  return lastContent;
};


/*
* render loop is used for rendering a list of elements. It will keep track of the elements and update them as needed
* @param func: a function that returns an array of html elements
* @param iterable: is the itterable that the func is based off of 
* @deps are any other dependency that is used in the loop
 */
export const renderLoop = (func: () => Array<HTMLElement | Text>, iterable: VentaState | any[], ...deps: any[]) => {
  let lastContent = func();
  let initialContent: Text | (HTMLElement | Text)[]; //used to determine initial anchor point. Text nodes are an invisible way to create an anchor
  let parent: ParentNode;
  let parentListStartIndex: number;

  const getKey = (elem: HTMLElement) => {
    const key = elem.getAttribute('key')
    if (key) return key
    throw Error('All elements in a loop must have a unique key');
  }
  if (iterable instanceof VentaState) {
    iterable.addSideEffect(() => {
      const newContent = func();
      const oldKeysMap = new Map<string, number>();
      const newKeysMap = new Map<string, number>();

      if (!parent) {
        //basically figure out where the anchor point is to add children
        if (Array.isArray(initialContent)) {
          parent = lastContent[0].parentNode!;
          const childrenList = Array.from(parent.childNodes);
          parentListStartIndex = childrenList.indexOf(lastContent[0]);
          //because the child could be some type of conditonal element we actually want to reset last content
          lastContent = Array.from(parent.children).slice(parentListStartIndex, parentListStartIndex + lastContent.length)
        } else {
          parent = initialContent.parentNode!;
          const childrenList = Array.from(parent.childNodes);
          parentListStartIndex = childrenList.indexOf(initialContent as ChildNode);
        }
      }

      // Create maps for keys
      lastContent.forEach((elem, i) => {
        if (elem instanceof Element) {
          oldKeysMap.set(getKey(elem), i)
        }
        else {
          //text nodes are always replaced
          const componentId = componentReferenceMap.get(elem)
          if (componentId !== undefined) {
            handleComponentUnmount(componentId, elem)
          }
        }

      })
      newContent.forEach((elem, i) => {
        if (elem instanceof Element) {
          newKeysMap.set(getKey(elem), i);
        }
      })

      // Remove old nodes
      oldKeysMap.forEach((oldIndex, key) => {
        if (!newKeysMap.has(key)) {
          const node = lastContent[oldIndex]
          handleUnmountElement(node)
        }
      });

      // Add or move new nodes
      let offset = 0; // because we are adding and removing nodes here offset helps us determine the correct index
      const children = Array.from(parent.children) //this is needed for reference as in the case order changes I cannot refference the current parent
      newContent.forEach((node, i) => {
        if (!(node instanceof Element)) {
          parent.insertBefore(node, parent.childNodes[parentListStartIndex + i]);
          offset += 1
          return;
        }

        // basically checking if this node already exists - because when the new content array essentailly recreates each node
        const key = getKey(node);
        const oldIndex = oldKeysMap.get(key);
        //if it does exist this new node actually needs to be deleted
        if (oldIndex !== undefined) {
          handleUnmountElement(node)
        }

        if (oldIndex === undefined) {
          // Insert new node
          parent.insertBefore(node, parent.childNodes[parentListStartIndex + i]);
          offset += 1
        }
        else if (oldIndex !== i - offset) {
          // Move existing node
          parent.insertBefore(children[oldIndex], parent.childNodes[parentListStartIndex + i]);
        }
      });

      lastContent = newContent;
    });
  }
  initialContent = lastContent.length ? lastContent : document.createTextNode('');
  return initialContent;
};
