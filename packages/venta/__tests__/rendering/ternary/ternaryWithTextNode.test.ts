/**
 * @jest-environment jsdom
 */

import { describe, expect, it, beforeAll } from 'vitest'
import {
  elementMap,
} from '../../../src/state';
import {
  registerConditional,
  renderTextNode,
} from '../../../src/utils';
import { NodeTypes, useState, VentaState } from '../../../src';


describe('conditional jsx render with text nodes', () => {
  let count: VentaState<number>, element: NodeTypes;

  beforeAll(() => {
    count = useState(3);

    const test = () => count.value > 2;

    const trueContent = () => renderTextNode('Count is Greater than 2');
    const falseContent = () => renderTextNode(count);

    element = registerConditional(test, trueContent, falseContent, count) as Text
  });

  it('should render the correct conditional initially', () => {
    expect(count.getSideEffects().size).toBe(1);
    expect(count.getElements().size).toBe(0);
    expect(elementMap.has(element)).toBe(true);

    expect(element.textContent).toBe('Count is Greater than 2');
  });

  it('text node should be displayed properly', () => {
    count.setValue(0);

    expect(count.getSideEffects().size).toBe(1);
    expect(count.getElements().size).toBe(1);
    expect(elementMap.has(element)).toBe(false);
    expect(elementMap.has(Array.from(count.getElements())[0])).toBe(true);

    element = Array.from(count.getElements())[0]
    expect(element.textContent).toBe('0');
  });


  it('text nodes can update properly', () => {
    count.setValue(1);

    expect(count.getSideEffects().size).toBe(1);
    expect(count.getElements().size).toBe(1);
    expect(elementMap.has(element)).toBe(true);
    expect(element.textContent).toBe('1');
  });

  it('text node and deps should be deleted properly', () => {
    count.setValue(4);

    expect(elementMap.has(element)).toBe(false);

    expect(count.getSideEffects().size).toBe(1);
    expect(count.getElements().size).toBe(0);
  });
});
