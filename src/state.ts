import { VentaNode } from "./types";


let componentId = 0;

export const getComponentId = () => componentId;

export const incrementComponentId = () => {
  componentId += 1;
};



export class VentaState {
  private static currentStateId: number = 0;
  protected id: number;
  protected sideEffects: Set<Function>;
  protected elements: Set<HTMLElement | Text>;
  protected conditionalElements: Set<Function>;
  value: any;

  constructor(
    value: any,
    sideEffects: Set<Function> = new Set(),
    elements: Set<HTMLElement | Text> = new Set(),
    conditionalElements: Set<Function> = new Set()
  ) {
    this.id = VentaState.currentStateId++;
    this.value = value;
    this.sideEffects = sideEffects;
    this.elements = elements;
    this.conditionalElements = conditionalElements;

    componentStateMap.get(getComponentId())?.state.push(this);
    stateMap.set(this.id, this)
  }

  protected updateNode(elem: HTMLElement | Text, stateIndex: number) {
    const elementState = elementMap.get(elem)
    if (!elementState) throw new Error('element state not found')
    const { attributeState, childState } = elementState

    if (elem instanceof HTMLElement) {
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
    this.conditionalElements.forEach((test) => test());
  }

  getElements() {
    return this.elements;
  }

  getConditionalElements() {
    return this.conditionalElements;
  }

  addElement(element: HTMLElement | Text) {
    this.elements.add(element)
  }

  deleteElement(element: HTMLElement | Text) {
    this.elements.delete(element)
  }

  addSideEffect(callback: Function) {
    this.sideEffects.add(callback)
  }

  addConditionalElements(callback: () => HTMLElement | Text | void) {
    this.conditionalElements.add(callback)
  }

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
    elements: Set<HTMLElement | Text> = new Set(),
    conditionalElements: Set<Function> = new Set()
  ) {
    super(value, sideEffects, elements, conditionalElements)
    this.callback = callback;
  }

  setValue(_: any): void {
    this.value = this.callback();
    this.sideEffects.forEach((sideEffect) => sideEffect());
    this.elements.forEach((node) => this.updateNode(node, this.id));
    this.conditionalElements.forEach((test) => test());
  }
}

export const componentReferenceMap = new Map<HTMLElement | Text, number>();
export const componentStateMap = new Map<number, { state: VentaState[], unmountCallbacks: Function[] }>();
export const stateMap = new Map<number, VentaState>();
export const elementMap = new Map<HTMLElement | Text, VentaNode>();
