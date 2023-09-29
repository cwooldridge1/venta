import {
  VentaMemoState,
  VentaState,
} from '../state';

const useMemo = (callback: () => any, dependencies: VentaState[]) => {

  const state = new VentaMemoState(callback(), callback)

  dependencies.forEach((dep) => {
    if (dep instanceof VentaState) {
      dep.addSideEffect(state.setValue.bind(state));
    } else {
      throw new Error('Dependency must be of type VentaState')
    }
  });

  return state;
};

export default useMemo;
