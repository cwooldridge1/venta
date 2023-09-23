export interface VentaState {
  id: number;
  value: any;
  sideEffects: Function[];
  elements: Array<HTMLElement | Text>;
  conditionalElements: Function[];
  setValue: (newValue: any) => void;
}

export type Props = {
  [key: string]: any;
};
export interface VentaNode {
  element: HTMLElement | Text;
  attributeState: Record<number, Array<[string, VentaState]>>; //used to know exactly what attributes to update
  childState: Record<number, Array<[number, VentaState]>>; //used to know exactly what chil
}
