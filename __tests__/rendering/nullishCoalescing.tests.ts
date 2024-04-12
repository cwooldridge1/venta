/**
 * @jest-environment jsdom
 */
import {
  NodeTypes,
  elementMap,
} from '../../src/state';
import {
  registerConditional,
  renderVentaNode,
} from '../../src/utils';
import { useState, VentaState } from '../../src';

describe('Venta functions', () => {

  describe('conditional jsx render', () => {
    let userName: VentaState<string | null>, element: NodeTypes;

    beforeAll(() => {
      userName = useState<string | null>(null);

      const test = () => userName.value === undefined || userName.value === null;
      console.log('test', test())

      const trueContent = () => renderVentaNode('span', {}, "Guest");
      const falseContent = () => renderVentaNode('span', {}, userName);

      element = registerConditional(test, trueContent, falseContent, userName);
      document.body.appendChild(element);
    });

    it('should render the correct conditional initially', () => {
      expect(userName.getSideEffects().size).toBe(1);
      expect(elementMap.size).toBe(1)

      element = document.body.querySelector('span')!;
      expect(element.textContent).toBe('Guest');
    });

    it('update to truthy value', () => {
      userName.setValue('Joe');

      element = document.body.querySelector('span')!;
      expect(elementMap.has(element)).toBe(true);
      expect(element.textContent).toBe('Joe');
    });

    it('reset to not be shown', () => {
      userName.setValue(null);

      element = document.body.querySelector('span')!;
      expect(element.textContent).toBe('Guest');
      expect(elementMap.size).toBe(1)
      expect(userName.getSideEffects().size).toBe(1);
    });
  });
});
