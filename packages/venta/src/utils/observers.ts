import { COMPONENT_ID_ATTRIBUTE } from "../constants";
import { getSharedState } from "./enviroment-helpers";

export const createDeletionObserver = () => {
  return new MutationObserver(mutations => {
    const { componentCleanUpMap, elementToComponentId } = getSharedState().VentaAppState
    mutations.forEach(mutation => {
      if (mutation.removedNodes.length) {
        mutation.removedNodes.forEach(removedNode => {
          if (removedNode.cleanUp) {
            removedNode.cleanUp()
            return
          }
          let id = removedNode[COMPONENT_ID_ATTRIBUTE]
          if (id !== undefined) {
            const cleanUpFunctions = componentCleanUpMap.get(id);
            cleanUpFunctions.forEach(func => func())
            componentCleanUpMap.delete(id)
          }
          else {
            const id = elementToComponentId.get(removedNode);
            if (id) {
              const cleanUpFunctions = componentCleanUpMap.get(id);
              cleanUpFunctions.forEach(func => func())
              elementToComponentId.delete(removedNode)
              componentCleanUpMap.delete(id)
            }
          }
        });
      }
    });
  });
}
