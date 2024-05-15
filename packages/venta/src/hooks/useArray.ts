import { VentaStateArray } from "../state";

const useArray = <T>(initialValue: T[]) => {
  return new VentaStateArray(...initialValue);
};

export default useArray;
