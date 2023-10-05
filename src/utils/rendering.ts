import { elementMap, stateMap } from "../state"
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
    if (child instanceof HTMLElement || child.nodeType) {
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

export const registerConditional = (
  test: () => boolean,
  contentIfTrue: (() => HTMLElement | Text),
  contentIfFalse: (() => HTMLElement | Text),
  ...deps: Array<VentaState | any>
): HTMLElement | Text => {
  let lastContent: HTMLElement | Text;
  let localCache = new Map<boolean, HTMLElement | Text>();


  deps.forEach(dep => {
    if (!(dep instanceof VentaState)) return; // this is our filter as the compiler attaches all related variables
    dep.addSideEffect(() => {
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
      const componentId = componentReferenceMap.get(lastContent)
      if (componentId !== undefined) {
        handleComponentUnmount(componentId, lastContent)
      }
      elementMap.delete(lastContent)
      lastContent.replaceWith(content)
      lastContent = content;
    })
  })
  let testValue = test()
  const lastCount = callCount
  lastContent = testValue ? contentIfTrue() : contentIfFalse();
  if (callCount === lastCount) { // this means that what was rendered was an html element or a component
    localCache.set(testValue, lastContent)
  }

  return lastContent;
};

export const renderLoop = (func: () => Array<HTMLElement>, iterable: any, ...deps: any[]) => {
  let lastContent = func();
  let initialContent: Text | HTMLElement[]; //used to determine initial anchor point. Text nodes are an invisible way to create an anchor
  let parent: ParentNode;
  let parentListStartIndex: number;

  const statefulDeps: VentaState[] = deps.filter((dep: any) => dep instanceof VentaState)

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
        //basically figure out where the anchor point it to add children
        if (Array.isArray(initialContent)) {
          parent = lastContent[0].parentNode!;
          const childrenList = Array.from(parent.children);
          parentListStartIndex = childrenList.indexOf(lastContent[0]);
        } else {
          parent = initialContent.parentNode!;
          const childrenList = Array.from(parent.childNodes);
          parentListStartIndex = childrenList.indexOf(initialContent as ChildNode);
        }
      }

      // Create maps for keys
      lastContent.forEach((elem, i) => oldKeysMap.set(getKey(elem), i));
      newContent.forEach((elem, i) => newKeysMap.set(getKey(elem), i));

      // Remove old nodes
      oldKeysMap.forEach((oldIndex, key) => {
        if (!newKeysMap.has(key)) {
          const node = lastContent[oldIndex]
          elementMap.delete(node)
          statefulDeps.forEach(state => {
            state.deleteElement(node)
          })
          node.remove();
        }
      });

      // Add or move new nodes
      let offset = 0;
      const children = Array.from(parent.children) //this is needed for reference as in the case order changes I cannot refference the current parent
      newContent.forEach((node, i) => {
        const key = getKey(node);
        const oldIndex = oldKeysMap.get(key);

        if (oldIndex !== undefined) {
          elementMap.delete(node)
          statefulDeps.forEach(state => {
            state.deleteElement(node) //new node wont get inserted because old one already exists so we delete
          })
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
