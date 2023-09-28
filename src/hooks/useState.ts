import {
  VentaState,
} from '../state';

const useState = (initialValue: any) => {
  const state = new VentaState(initialValue);
  return state;
};

export default useState;
