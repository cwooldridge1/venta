import { stateMap, getComponentId, componentStateMap } from "../state";
import { VentaState } from "../types";

const useEffect = (callback: any, dependencies: VentaState[]) => {
  const unmountCallback = callback();
  componentStateMap.get(getComponentId())?.unmountCallbacks.push(unmountCallback)
  dependencies.forEach((dep) => {
    const state = stateMap.get(dep.id)
    if (!state) throw new Error('dependencies must be of type VentaState')
    state.sideEffects.push(callback)
  })
}

export default useEffect
