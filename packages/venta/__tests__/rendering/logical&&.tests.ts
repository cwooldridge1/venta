/**
 * @jest-environment jsdom
 */
import { describe, expect, it, beforeAll } from '@jest/globals'

import {
  elementMap,
} from '../../src/state';
import {
  registerConditional,
  renderVentaNode,
} from '../../src/utils';

import { NodeTypes, useState, VentaState } from '../../src';

describe('Venta functions', () => {

  describe('conditional jsx render', () => {
    let count: VentaState<number>, element: NodeTypes

    beforeAll(() => {
      count = useState(0);

      const test = () => count.value > 2;

      const trueContent = () => renderVentaNode('span', {}, 'Count is Greater than 2');
      const falseContent = () => document.createComment('') as any

      element = registerConditional(test, trueContent, falseContent, count);
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

    it('reset to not be shown', () => {
      count.setValue(1);

      element = document.body.querySelector('span')!;
      expect(element).toBe(null)
      expect(elementMap.size).toBe(0)
      expect(count.getSideEffects().size).toBe(1);
    });
  });
});
