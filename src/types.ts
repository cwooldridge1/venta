export interface VentaState {
  id: number;
  value: any;
  sideEffects: Function[];
  elements: HTMLElement[];
  conditionalElements: Function[];
  setValue: (newValue: any) => void;
}

export type Props = {
  [key: string]: any;
};
export interface VentaNode {
  element: HTMLElement;
  attributeState: Record<number, Array<[string, VentaState]>>;
  childState: Record<number, Array<[number, VentaState]>>;
}
