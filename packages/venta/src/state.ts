

let componentId = 0;
let conditionalId = 0;

export const getComponentId = () => componentId;

export const incrementComponentId = () => {
  componentId += 1;
};


export const getConditionalId = () => conditionalId

export const incrementConditionalId = () => {
  conditionalId += 1;
};



export class VentaState<T> {
  private static currentStateId: number = 0;
  protected id: number;
  protected sideEffects: Set<Function>;
  protected elements: Set<Venta.NodeTypes>;
  value: T;

  constructor(
    value: T,
    sideEffects: Set<Function> = new Set(),
    elements: Set<Venta.NodeTypes> = new Set(),
  ) {
    this.id = VentaState.currentStateId++;
    this.value = value;
    this.sideEffects = sideEffects;
    this.elements = elements;

    componentStateMap.get(getComponentId())?.state.push(this);
    stateMap.set(this.id, this)
  }

  protected updateNode(elem: Venta.NodeTypes, stateIndex: number) {
    const elementState = elementMap.get(elem)
    if (!elementState) return
    const { attributeState, childState } = elementState

    if (elem instanceof Element) {
      attributeState[stateIndex]?.forEach(([key, value]) => {
        elem.setAttribute(key, value.value)
        if ((elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA' || elem.tagName === 'SELECT') && key.toLowerCase() === 'value') {
          (elem as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value = value.value;
        }
      })
      childState[stateIndex]?.forEach(([index, value]) => {
        elem.childNodes[index].textContent = value.value
      })
    } else {
      elem.textContent = childState[stateIndex][0][1].value
    }
  }

  setValue(newValue: any): void {
    this.value = newValue;
    this.sideEffects.forEach((sideEffect) => sideEffect());
    this.elements.forEach((node) => this.updateNode(node, this.id));
  }

  getElements() {
    return this.elements;
  }

  addElement(element: Venta.NodeTypes) {
    this.elements.add(element)
  }

  deleteElement(element: Venta.NodeTypes) {
    this.elements.delete(element)
  }

  addSideEffect(callback: Function) {
    this.sideEffects.add(callback)
  }

  getSideEffects() { return this.sideEffects }

  getId() { return this.id }

  destroy() {
    this.elements.forEach(elem => elementMap.delete(elem))
    stateMap.delete(this.id)
  }

}

export class VentaMemoState<T> extends VentaState<T> {
  private callback: () => any
  constructor(
    value: T,
    callback: () => any,
    sideEffects: Set<Function> = new Set(),
    elements: Set<Venta.NodeTypes> = new Set(),
  ) {
    super(value, sideEffects, elements)
    this.callback = callback;
  }

  setValue(_: T): void {
    this.value = this.callback();
    this.sideEffects.forEach((sideEffect) => sideEffect());
    this.elements.forEach((node) => this.updateNode(node, this.id));
  }
}


export const componentReferenceMap = new Map<Venta.NodeTypes, number>(); // this is an inverse map tool essentially to help find the associated id with a component
export const componentStateMap = new Map<number, { state: VentaState<unknown>[], unmountCallbacks: Venta.EffectCallback[] }>(); // key is the component id and the value is all state and unmount callbacks that are defined in a component
export const stateMap = new Map<number, VentaState<unknown>>(); // all state is stored here, the key is the id and the value is the state
export const elementMap = new Map<Venta.NodeTypes, Venta.VentaNodeState>(); // element mao store what elements have what dependencies to help know exactly what needs to be updated in an element
export const conditionalMap = new Map<number, () => void>(); // conditonals are a special type of component and need to be kept track of mainly when used inside of things like looks to make sure they are cleaned up properly
export const conditionalReferenceMap = new Map<Venta.NodeTypes, number>(); // this is an inverse map tool essentially to help find the associated id with a conditional




export const VentaAppState = {
  stateMap,
  getComponentId,
  componentStateMap,
  componentReferenceMap,
  elementMap,
  conditionalMap,
  conditionalReferenceMap,
  getConditionalId,
  incrementComponentId,
  incrementConditionalId,
  VentaState,
  VentaMemoState
}
