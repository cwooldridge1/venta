import { describe, expect, it, beforeAll } from 'vitest'
import {
  elementMap,
} from '../../../src/state';
import {
  registerConditional,
  renderConditional,
  renderVentaNode,
} from '../../../src/utils';
import { useState } from '../../../src';

type VentaState<T> = Venta.VentaState<T>

describe('Venta functions', () => {

  describe('conditional jsx render', () => {
    let count: VentaState<number>, element: HTMLElement;

    beforeAll(() => {
      count = useState(0);

      const test = () => count.value > 0;


      const trueTernaryContent = () => renderVentaNode('span', {}, 'Count is Greater than 2');
      const falseTernaryContent = () => renderVentaNode('span', {}, 'Count is Less than 2');
      const ternary = () => renderConditional(() => count.value > 2, trueTernaryContent, falseTernaryContent, 1);
      const falseContent = () => document.createComment('') as any

      element = registerConditional(test, ternary, falseContent, count) as HTMLElement
      document.body.appendChild(element);
    });

    it('should render the correct conditional initially', () => {
      expect(count.getSideEffects().size).toBe(1);
      expect(elementMap.size).toBe(0)

      element = document.body.querySelector('span')!;
      expect(element).toBe(null);
    });

    it('should update to "greater than 2" when count is set to 3', () => {
      count.setValue(3);

      element = document.body.querySelector('span')!;
      expect(elementMap.has(element)).toBe(true);
      expect(element.textContent).toBe('Count is Greater than 2');
    });

    it('should update to "less than 2" when count is set to 1', () => {
      count.setValue(1);

      element = document.body.querySelector('span')!;
      expect(elementMap.has(element)).toBe(true);
      expect(element.textContent).toBe('Count is Less than 2');
    });

    it('reset to not be shown', () => {
      count.setValue(0);

      element = document.body.querySelector('span')!;
      expect(element).toBe(null)
      expect(elementMap.size).toBe(0)
      expect(count.getSideEffects().size).toBe(1);
    });
  });
});
