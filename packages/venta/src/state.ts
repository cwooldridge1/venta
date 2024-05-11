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
