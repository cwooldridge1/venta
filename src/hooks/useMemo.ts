import { getGlobalId, incrementGlobalId, stateMap } from "../state";
import { VentaState } from "../types";
import { updateNode } from "../utils";

const useMemo = (callback: any, dependencies: VentaState[]) => {
  const id = getGlobalId();
  incrementGlobalId();

  //this function is what should is ultimatley a dependency for other states to call
  const setState = () => {
    let state = stateMap.get(id)!
    const { sideEffects, elements } = state;
    state.state = callback();
    sideEffects.forEach(sideEffect => sideEffect());
    elements.forEach(node => updateNode(node, state.id))
  }

  stateMap.set(id, { sideEffects: [], elements: [], state: callback(), setState: () => { }, id: id });

  dependencies.forEach((dep) => {
    const state = stateMap.get(dep.id)
    if (!state) throw new Error('dependencies must be of type VentaState')
    state.sideEffects.push(setState)
  })

  return stateMap.get(id) as VentaState
}

export default useMemo;
