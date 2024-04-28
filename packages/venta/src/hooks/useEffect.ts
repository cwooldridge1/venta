import { getSharedState } from '../utils/enviroment-helpers';

const useEffect = (effect: () => Venta.EffectCallback, dependencies: Venta.DependencyList) => {
  const { componentStateMap, getComponentId, stateMap } = getSharedState().VentaAppState
  const unmountCallback = effect();
  if (unmountCallback) {
    componentStateMap.get(getComponentId())?.unmountCallbacks.push(unmountCallback)
  }
  dependencies.forEach((dep) => {
    const state = stateMap.get(dep.getId())
    if (!state) throw new Error('dependencies must be of type VentaState')
    state.addSideEffect(effect)
  })
}

export default useEffect
