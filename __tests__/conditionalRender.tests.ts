/**
 * @jest-environment jsdom
 */
import {
  elementMap,
} from '../src/state';
import {
  registerConditional,
  renderVentaNode,
} from '../src/utils';
import { useState, VentaState } from '../src';
import { jest } from '@jest/globals';

describe('Venta functions', () => {

  describe('conditional jsx render', () => {
    let count: VentaState, element: HTMLElement;

    beforeAll(() => {
      count = useState(0);

      const test = () => count.value > 2;

      const trueContent = () => renderVentaNode('span', {}, 'Count is Greater than 2');
      const falseContent = () => renderVentaNode('span', {}, 'Count is Less than 2');

      element = registerConditional(test, trueContent, falseContent, count);
      document.body.appendChild(element);
    });

    it('should render the correct conditional initially', () => {
      expect(count.conditionalElements.length).toBe(1);
      expect(elementMap.has(element)).toBe(true);

      element = document.body.querySelector('span')!;
      expect(element.textContent).toBe('Count is Less than 2');
    });

    it('should update to "greater than 2" when count is set to 3', () => {
      count.setValue(3);

      element = document.body.querySelector('span')!;
      expect(elementMap.has(element)).toBe(true);
      expect(element.textContent).toBe('Count is Greater than 2');
    });

    it('should update back to "less than 2" when count is set to 1', () => {
      count.setValue(1);

      element = document.body.querySelector('span')!;
      expect(elementMap.has(element)).toBe(true);
      expect(element.textContent).toBe('Count is Less than 2');
      expect(elementMap.size).toBe(1);
    });
  });
});