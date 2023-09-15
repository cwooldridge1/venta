
import { useState } from '../../src';

test('should react to dependencies changes', () => {
  const state = useState(0);

  // Initially, the computedValue should be 0
  expect(state.value).toBe(0);

  // Updating the state should update the computedValue
  state.setState(state.value + 1);
  expect(state.value).toBe(1);
});
