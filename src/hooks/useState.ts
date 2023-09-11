import { stateMap, getGlobalId, incrementGlobalId } from "../state";
import { VentaState } from "../types";
import { updateNode } from "../utils";

const useState = (initialValue: any) => {
  const id = getGlobalId();
  incrementGlobalId();
  const setState = (newValue: any) => {
    let state = stateMap.get(id)!
    const { sideEffects, elements, conditionalElements } = state
    state.value = newValue
    sideEffects.forEach(sideEffect => sideEffect());
    elements.forEach(node => updateNode(node, state.id))
    conditionalElements.forEach(test => test())
  }

  stateMap.set(id, { sideEffects: [], elements: [], conditionalElements: [], value: initialValue, setState: setState, id: id });

  return stateMap.get(id) as VentaState
}

export default useState;
