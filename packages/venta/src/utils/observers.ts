import { COMPONENT_ID_ATTRIBUTE } from "../constants";
import { getSharedState } from "./enviroment-helpers";



const handleRemoval = (node: Node) => {
  const { componentCleanUpMap, elementToComponentId } = getSharedState().VentaAppState
  if (node.cleanUp) {
    node.cleanUp()
  }
  else {
    let id = node[COMPONENT_ID_ATTRIBUTE]
    if (id !== undefined) {
      const cleanUpFunctions = componentCleanUpMap.get(id);
      cleanUpFunctions.forEach(func => func())
      componentCleanUpMap.delete(id)
    }
    else {
      const id = elementToComponentId.get(node);
      if (id) {
        const cleanUpFunctions = componentCleanUpMap.get(id);
        cleanUpFunctions.forEach(func => func())
        elementToComponentId.delete(node)
        componentCleanUpMap.delete(id)
      }
    }
  }
  node.childNodes.forEach(handleRemoval)
}

export const createDeletionObserver = () => {
  return new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.removedNodes.length) {
        mutation.removedNodes.forEach(handleRemoval)
      }
    });
  });
}
