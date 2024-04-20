/**
 * @jest-environment jsdom
 */

import { describe, expect, it, beforeAll } from '@jest/globals'
import {
  elementMap,
} from '../../../src/state';
import {
  registerConditional,
  renderVentaNode,
} from '../../../src/utils';
import { useMemo, useState, VentaState } from '../../../src';


describe('conditional jsx render', () => {
  let count: VentaState<number>, c: VentaState<number>, element: HTMLElement;

  beforeAll(() => {
    c = useState(0);
    count = useMemo(() => c.value, [c])

    const test = () => count.value > 2;

    const trueContent = () => renderVentaNode('span', {}, 'Count is Greater than 2');
    const falseContent = () => renderVentaNode('span', {}, 'Count is Less than 2');

    element = registerConditional(test, trueContent, falseContent, count) as HTMLElement;
    document.body.appendChild(element);
  });

  it('should render the correct conditional initially', () => {
    expect(count.getSideEffects().size).toBe(1);
    expect(c.getSideEffects().size).toBe(1);
    expect(elementMap.has(element)).toBe(true);

    element = document.body.querySelector('span')!;
    expect(element.textContent).toBe('Count is Less than 2');
  });

  it('should update to "greater than 2" when count is set to 3', () => {
    c.setValue(3);

    element = document.body.querySelector('span')!;
    expect(elementMap.has(element)).toBe(true);
    expect(element.textContent).toBe('Count is Greater than 2');
  });

  it('should update back to "less than 2" when count is set to 1', () => {
    c.setValue(0);

    element = document.body.querySelector('span')!;
    expect(elementMap.has(element)).toBe(true);
    expect(element.textContent).toBe('Count is Less than 2');
    expect(elementMap.size).toBe(1);
  });
});
