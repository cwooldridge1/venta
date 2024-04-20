import { VentaState } from "./state";
export { VentaState } from './state'

export type Props = {
  [key: string]: any;
};

export type NodeTypes = Element | Text | Comment;

export interface VentaNode {
  element: HTMLElement | Text | Comment;
  attributeState: Record<number, Array<[string, VentaState<any>]>>; //used to know exactly what attributes to update
  childState: Record<number, Array<[number, VentaState<any>]>>; //used to know exactly what child to update. the key is associated with what state there is and the array contains the index of child and the state to be updated
}
