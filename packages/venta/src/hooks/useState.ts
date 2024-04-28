import { getSharedState } from "../utils/enviroment-helpers";

const useState = <T>(initialValue: T) => {
  const { VentaState } = getSharedState().VentaAppState;
  const state = new VentaState(initialValue);
  return state;
};

export default useState;
