import { describe, expect, it, beforeAll } from 'vitest'

import {
} from '../../../src/state';
import {
  createElement,
  registerConditional,
} from '../../../src/utils';
import { useState } from '../../../src';

type VentaState<T> = Venta.VentaState<T>

describe('conditional jsx render', () => {
  let count: VentaState<number>, element: HTMLElement;

  beforeAll(() => {
    count = useState(0);

    const test = () => count.value > 2;

    const trueContent = () => createElement('span', {}, 'Count is Greater than 2');
    const falseContent = () => createElement('span', {}, 'Count is Less than 2');

    element = registerConditional(test, trueContent, falseContent, count) as HTMLElement;
    document.body.appendChild(element);
  });

  it('should render the correct conditional initially', () => {
    expect(count.getSideEffects().size).toBe(1);
    element = document.body.querySelector('span')!;
    expect(element.textContent).toBe('Count is Less than 2');
  });

  it('should update to "greater than 2" when count is set to 3', () => {
    count.setValue(3);

    element = document.body.querySelector('span')!;
    expect(element.textContent).toBe('Count is Greater than 2');
  });

  it('should update back to "less than 2" when count is set to 1', () => {
    count.setValue(1);

    element = document.body.querySelector('span')!;
    expect(element.textContent).toBe('Count is Less than 2');
  });
});
