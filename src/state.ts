import { VentaNode } from "./types";


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



export class VentaState {
  private static currentStateId: number = 0;
  protected id: number;
  protected sideEffects: Set<Function>;
  protected elements: Set<Element | Text>;
  value: any;

  constructor(
    value: any,
    sideEffects: Set<Function> = new Set(),
    elements: Set<Element | Text> = new Set(),
  ) {
    this.id = VentaState.currentStateId++;
    this.value = value;
    this.sideEffects = sideEffects;
    this.elements = elements;

    componentStateMap.get(getComponentId())?.state.push(this);
    stateMap.set(this.id, this)
  }

  protected updateNode(elem: Element | Text, stateIndex: number) {
    const elementState = elementMap.get(elem)
    if (!elementState) throw new Error('element state not found')
    const { attributeState, childState } = elementState

    if (elem instanceof Element) {
      attributeState[stateIndex]?.forEach(([key, value]) => {
        elem.setAttribute(key, value.value)
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

  addElement(element: Element | Text) {
    this.elements.add(element)
  }

  deleteElement(element: Element | Text) {
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

export class VentaMemoState extends VentaState {
  private callback: () => any
  constructor(
    value: any,
    callback: () => any,
    sideEffects: Set<Function> = new Set(),
    elements: Set<Element | Text> = new Set(),
  ) {
    super(value, sideEffects, elements)
    this.callback = callback;
  }

  setValue(_: any): void {
    this.value = this.callback();
    this.sideEffects.forEach((sideEffect) => sideEffect());
    this.elements.forEach((node) => this.updateNode(node, this.id));
  }
}

export const componentReferenceMap = new Map<Element | Text, number>(); // this is an inverse map tool essentially to help find the associated id with a component
export const componentStateMap = new Map<number, { state: VentaState[], unmountCallbacks: Function[] }>(); // key is the component id and the value is all state and unmount callbacks that are defined in a component
export const stateMap = new Map<number, VentaState>(); // all state is stored here, the key is the id and the value is the state
export const elementMap = new Map<Element | Text, VentaNode>(); // element mao store what elements have what dependencies to help know exactly what needs to be updated in an element
export const conditionalMap = new Map<number, () => void>(); // conditonals are a special type of component and need to be kept track of mainly when used inside of things like looks to make sure they are cleaned up properly
export const conditionalReferenceMap = new Map<Element | Text, number>(); // this is an inverse map tool essentially to help find the associated id with a conditional
