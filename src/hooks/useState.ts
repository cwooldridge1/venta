import { stateMap, getGlobalId, incrementGlobalId, componentStateMap, getComponentId } from "../state";
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

  const state = stateMap.get(id) as VentaState
  componentStateMap.get(getComponentId())?.state.push(state)
  return state
}

export default useState;
