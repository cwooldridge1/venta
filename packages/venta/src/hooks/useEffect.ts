import type { VentaState } from '../types'
import { getSharedState } from '../utils/enviroment-helpers';

const useEffect = (callback: () => () => any | void, dependencies: VentaState<any>[]) => {
  const { componentStateMap, getComponentId, stateMap } = getSharedState().VentaAppState
  const unmountCallback = callback();

  componentStateMap.get(getComponentId())?.unmountCallbacks.push(unmountCallback)
  dependencies.forEach((dep) => {
    const state = stateMap.get(dep.getId())
    if (!state) throw new Error('dependencies must be of type VentaState')
    state.addSideEffect(callback)
  })
}

export default useEffect
