import { VentaState } from '../state';
import { getSharedState } from '../utils/enviroment-helpers';

const useEffect = (effect: () => Venta.EffectCallback | void, dependencies: Venta.DependencyList) => {
  const { componentCleanUpMap, componentCounter } = getSharedState().VentaAppState
  const unmountCallback = effect();
  if (unmountCallback) {
    const cleanUps = componentCleanUpMap.get(componentCounter.getCount())
    if (!cleanUps) {
      componentCleanUpMap.set(componentCounter.getCount(), [unmountCallback])
    } else {
      cleanUps.push(unmountCallback)
    }
  }
  if (unmountCallback) {
    dependencies.forEach((dep) => {
      if (dep instanceof VentaState) {
        dep.addSideEffect(effect)
      } else {
        throw new Error('Dependency must be of type VentaState')
      }
    })
  }
}

export default useEffect
