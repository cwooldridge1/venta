import { VentaState } from "./state";
export { VentaState } from './state'

export type Props = {
  [key: string]: any;
};

export type NodeTypes = HTMLElement | Text | Comment;

export interface VentaNodeState {
  element: HTMLElement | Text | Comment;
  attributeState: Record<number, Array<[string, VentaState<any>]>>; //used to know exactly what attributes to update
  childState: Record<number, Array<[number, VentaState<any>]>>; //used to know exactly what child to update. the key is associated with what state there is and the array contains the index of child and the state to be updated
}

export type VentaNode =
  | HTMLElement | Text | Comment
  | VentaState<any>
  | VentaState<any>[]
  | string
  | number
  | Iterable<VentaNode>
  | boolean
  | null
  | undefined
