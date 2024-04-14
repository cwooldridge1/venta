import {
  VentaState,
} from '../state';

const useState = <T>(initialValue: T) => {
  const state = new VentaState(initialValue);
  return state;
};

export default useState;
