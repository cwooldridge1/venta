/**
 * @jest-environment jsdom
 */
import {
  elementMap,
} from '../../../src/state';
import {
  registerConditional,
  renderTextNode,
} from '../../../src/utils';
import { useState, VentaState } from '../../../src';
import { jest } from '@jest/globals';


describe('conditional jsx render with text nodes', () => {
  let count: VentaState, element: Text | HTMLElement;

  beforeAll(() => {
    count = useState(3);

    const test = () => count.value > 2;

    const trueContent = () => renderTextNode('Count is Greater than 2');
    const falseContent = () => renderTextNode(count);

    element = registerConditional(test, trueContent, falseContent, count) as Text
  });

  it('should render the correct conditional initially', () => {
    expect(count.conditionalElements.length).toBe(1);
    expect(count.elements.length).toBe(0);
    expect(elementMap.has(element)).toBe(true);

    expect(element.textContent).toBe('Count is Greater than 2');
  });

  it('text node should be displayed properly', () => {
    count.setValue(0);

    expect(count.conditionalElements.length).toBe(1);
    expect(count.elements.length).toBe(1);
    expect(elementMap.has(element)).toBe(false);
    expect(elementMap.has(count.elements[0])).toBe(true);

    element = count.elements[0]
    expect(element.textContent).toBe('0');
  });

  it('text node and deps should be deleted properly', () => {
    count.setValue(4);

    expect(elementMap.has(element)).toBe(false);

    expect(count.conditionalElements.length).toBe(1);
    expect(count.elements.length).toBe(0);
  });
});
