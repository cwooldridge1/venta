import {
  componentStateMap,
  getComponentId,
  getGlobalId,
  incrementGlobalId,
  stateMap,
} from '../state';
import { VentaState } from '../types';
import { updateNode } from '../utils';

const useMemo = (callback: any, dependencies: VentaState[]) => {
  const id = getGlobalId();
  incrementGlobalId();

  //this function is what should is ultimatley a dependency for other states to call
  const setValue = () => {
    let state = stateMap.get(id)!;
    const { sideEffects, elements, conditionalElements } = state;
    state.value = callback();
    sideEffects.forEach((sideEffect) => sideEffect());
    elements.forEach((node) => updateNode(node, state.id));
    conditionalElements.forEach((test) => test());
  };

  stateMap.set(id, {
    sideEffects: [],
    elements: [],
    conditionalElements: [],
    value: callback(),
    setValue: () => {},
    id: id,
  });
  const state = stateMap.get(id) as VentaState;

  componentStateMap.get(getComponentId())?.state.push(state);

  dependencies.forEach((dep) => {
    const state = stateMap.get(dep.id);
    if (!state) throw new Error('dependencies must be of type VentaState');
    state.sideEffects.push(setValue);
  });

  return state;
};

export default useMemo;
