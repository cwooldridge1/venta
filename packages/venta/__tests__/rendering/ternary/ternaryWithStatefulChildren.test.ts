/**
 * @jest-environment jsdom
 */

import { describe, expect, it, beforeAll } from 'vitest'
import {
  elementMap,
} from '../../../src/state';
import {
  registerConditional,
  renderVentaNode,
} from '../../../src/utils';
import { useState, VentaState } from '../../../src';


describe('test clean up of state html dependencies', () => {
  let count: VentaState<number>, element: HTMLElement;

  beforeAll(() => {
    count = useState(0);

    const test = () => count.value > 2;

    const trueContent = () => renderVentaNode('span', {}, count);
    const falseContent = () => renderVentaNode('span', {}, 'less than 2');

    element = registerConditional(test, trueContent, falseContent, count) as HTMLElement;
    document.body.appendChild(element);
  });

  it('should render the correct conditional initially', () => {
    expect(count.getElements().size).toBe(0);

    element = document.body.querySelector('span')!;
    expect(element.textContent).toBe('less than 2');
  });

  it('should update to "greater than 2" when count is set to 3', () => {
    count.setValue(3);

    expect(count.getElements().size).toBe(1);
    element = document.body.querySelector('span')!;
    expect(elementMap.has(element)).toBe(true);
    expect(element.textContent).toBe('3');
  });

  it('should update back to "less than 2" when count is set to 1', () => {
    count.setValue(1);

    expect(count.getElements().size).toBe(0);

    element = document.body.querySelector('span')!;
    expect(element.textContent).toBe('less than 2');
  });
});
