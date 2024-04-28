import { getSharedState } from "../utils/enviroment-helpers";

const useMemo = <T>(callback: () => T, dependencies: Venta.DependencyList) => {
  const { VentaMemoState: Memo, VentaState: State } = getSharedState().VentaAppState

  const state = new Memo(callback(), callback)

  dependencies.forEach((dep) => {
    if (dep instanceof State) {
      dep.addSideEffect(state.setValue.bind(state));
    } else {
      throw new Error('Dependency must be of type VentaState')
    }
  });

  return state;
};

export default useMemo;
