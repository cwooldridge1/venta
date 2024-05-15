type ElementAttributes = { key: string, element: HTMLElement };

export class VentaState<T> {
  protected id: number;
  protected sideEffects?: Set<Function>
  protected textNodes?: Text[]
  protected elementAttributes?: ElementAttributes[];
  value: T;

  constructor(
    value: T,
  ) {
    this.value = value;
  }


  setValue(newValue: any): void {
    this.value = newValue;
    this.textNodes?.forEach((node) => {
      node.textContent = JSON.stringify(newValue)
    });
    this.elementAttributes?.forEach(({ key, element }) => {
      element.setAttribute(key, newValue);
      if ((element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') && key.toLowerCase() === 'value') {
        (element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value = newValue;
      }
    })
    this.sideEffects?.forEach((sideEffect) => sideEffect());
  }

  addTextNode(element: Text) {
    if (!this.textNodes) this.textNodes = []
    this.textNodes.push(element)
  }
  addElementAttribute(key: string, element: HTMLElement) {
    if (!this.elementAttributes) this.elementAttributes = []
    this.elementAttributes.push({ key, element });
  }


  addSideEffect(callback: Function) {
    if (!this.sideEffects) this.sideEffects = new Set()
    this.sideEffects.add(callback)
  }

  getSideEffects() {
    if (!this.sideEffects) this.sideEffects = new Set()
    return this.sideEffects
  }
}

export class VentaMemoState<T> extends VentaState<T> {
  private callback: () => any
  constructor(
    value: T,
    callback: () => any,
  ) {
    super(value)
    this.callback = callback;
  }

  setValue(_: T): void {
    this.value = this.callback();
    this.textNodes?.forEach((node) => {
      node.textContent = JSON.stringify(this.value)
    });
    this.elementAttributes?.forEach(({ key, element }) => {
      element.setAttribute(key, JSON.stringify(this.value));
      if ((element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') && key.toLowerCase() === 'value') {
        (element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value = JSON.stringify(this.value);
      }
    })
    this.sideEffects?.forEach((sideEffect) => sideEffect());
  }
}
type SideEffectMeta<T> = { startAnchor: Comment, endAnchor: Comment, parent: ParentNode, renderFunc: (item: T) => HTMLElement }
export class VentaArrayState<T> {

  private arr: T[]
  private sideEffectsMeta: SideEffectMeta<T>[] = []

  constructor(
    ...items: T[]
  ) {
    this.arr = items
  }

  value() {
    return [...this.arr]
  }


  push(...items: T[]) {
    const res = this.arr.push(...items)
    this.applySideEffects(({ renderFunc, endAnchor }) => {
      const newContent = this.createElements(renderFunc, items)
      endAnchor.before(...newContent)
    })
    return res;
  }

  unshift(...items: T[]) {
    const res = this.arr.push(...items)
    this.applySideEffects(({ renderFunc, startAnchor }) => {

      const newContent = this.createElements(renderFunc, items)
      startAnchor.after(...newContent)
    })
    return res;
  }


  splice(index: number, deleteCount?: number, ...items: T[]) {
    const res = this.arr.splice(index, deleteCount, ...items)

    this.applySideEffects(({ parent, startAnchor, endAnchor, renderFunc }) => {
      const children = this.getChildren(startAnchor)
      const listStartIndex = children.indexOf(startAnchor) + 1

      for (let i = 0; i < deleteCount; i++) {
        parent.removeChild(parent.children[listStartIndex + index]);
      }
      if (items.length > 0) {
        const newContent = this.createElements(renderFunc, items)

        const insertAnchor = children[index] || endAnchor;
        insertAnchor.before(...newContent);
      }
    })
    return res;
  };

  pop() {
    const res = this.arr.pop()
    this.applySideEffects(({ endAnchor }) => {
      if (res) {
        endAnchor.previousSibling?.remove()
      }
    })
    return res;
  }
  // ----------
  // custom methods //
  //  -------
  clear() {
    const res = this.arr.splice(0, this.arr.length)

    this.applySideEffects(({ parent, startAnchor }) => {

      const childrenToDelete = this.getChildren(startAnchor)

      let i = childrenToDelete.length
      while (i--) {
        parent.removeChild(childrenToDelete[i])
      }
    })
    return res;
  }

  reset(...items: T[]) {
    this.arr = items
    this.applySideEffects(({ parent, startAnchor, endAnchor, renderFunc }) => {
      const newContent = this.createElements(renderFunc, items)
      const newContentLength = newContent.length;
      const lastContent = this.getChildren(startAnchor)
      const lastContentLength = lastContent.length

      let i = 0;
      while (i < lastContentLength && i < newContentLength) {
        lastContent[i].replaceWith(newContent[i])
        i++;
      }
      if (i < newContentLength) {
        endAnchor.before(...newContent.slice(i))
        return
      }

      while (i < lastContentLength) {
        parent.removeChild(lastContent[i])
        i++
      }

    })
  }

  swap(index1: number, index2: number) {
    const temp = this.arr[index1]
    this.arr[index1] = this.arr[index2]
    this.arr[index2] = temp

    this.applySideEffects(({ parent, startAnchor, endAnchor }) => {
      const children = this.getChildren(startAnchor)
      const temp = children[index1].nextSibling
      const child1 = children[index1]
      const child2 = children[index2]
      parent.insertBefore(child1, child2)
      if (!temp) {
        endAnchor.before(child2)
      } else {
        parent.insertBefore(child2, temp)
      }
    })
  }

  private createElements(func: (item: T) => HTMLElement, items: T[]) {
    return items.map(func)
  }

  private getChildren(startAnchor: Comment): ChildNode[] {
    const parent = startAnchor.parentNode!;
    const children = Array.from(parent.childNodes)
    const startElementIndex = children.indexOf(startAnchor)
    return children.slice(startElementIndex + 1, children.length - 1)
  }

  private applySideEffects(func: (meta: SideEffectMeta<T>) => void) {
    // we need to know the anchor point for where this is at in the dom
    this.sideEffectsMeta.forEach((meta) => {
      if (!meta.parent) {
        const parent = meta.startAnchor.parentNode!;
        meta.parent = parent;
      }
      func(meta)
    })
  }

  _addHTMLSideEffect(startAnchor: Comment, endAnchor: Comment, renderFunc: (arr: T) => HTMLElement) {
    this.sideEffectsMeta.push({ startAnchor, endAnchor, parent: null, renderFunc });
  }
}

class ComponentCounter {
  private static count = 0;
  increment() {
    ComponentCounter.count++;
  }
  decrement() {
    ComponentCounter.count--;
  }
  getCount() {
    return ComponentCounter.count
  }
}

export const componentCounter = new ComponentCounter()
const componentCleanUpMap = new Map<number, (() => void)[]>()
const elementToComponentId = new Map<Node, number>() // text nodes and comment nodes cant be branded so this is needed


export const VentaAppState = {
  componentCleanUpMap,
  componentCounter,
  elementToComponentId,
  VentaState,
  VentaMemoState
}
