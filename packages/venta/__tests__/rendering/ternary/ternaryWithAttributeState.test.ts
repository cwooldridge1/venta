import { describe, expect, it, beforeAll } from 'vitest'
import {
  registerConditional,
  createStatefulTextNode,
  createDeletionObserver,
  createStatefulElement,
} from '../../../src/utils';
import { useState } from '../../../src';
import { VentaState } from '../../../src/state';

type NodeTypes = Venta.NodeTypes

const deletionObserver = createDeletionObserver()

describe('conditional jsx render with text nodes', () => {
  let count: VentaState<number>, element: NodeTypes;

  beforeAll(() => {
    count = useState(3);

    const test = () => count.value > 2;

    const trueContent = () => document.createTextNode('Count is Greater than 2');
    const falseContent = () => createStatefulElement('div', { id: count.value }, { id: [count] }, createStatefulTextNode(count.value, [count]));

    const parent = document.createElement('div');

    element = registerConditional(test, trueContent, falseContent, count) as Text

    parent.appendChild(element);
    document.body.appendChild(parent);
    const config = { childList: true, subtree: true }
    deletionObserver.observe(document.body, config)
  });

  it('should render the correct conditional initially', () => {
    expect(count.getSideEffects().size).toBe(1);
    expect(count._getElementAttributes().length).toBe(0);
    expect(count._getTextNodes().length).toBe(0);

    expect(element.textContent).toBe('Count is Greater than 2');
  });

  it('text node should be displayed properly', () => {
    count.setValue(0);

    expect(count.getSideEffects().size).toBe(1);
    expect(count._getElementAttributes().length).toBe(1);
    expect(count._getTextNodes().length).toBe(1);

    element = Array.from(count._getTextNodes())[0]
    expect(element.textContent).toBe('0');
  });


  it('text nodes can update properly', () => {
    count.setValue(1);

    expect(count.getSideEffects().size).toBe(1);
    expect(count._getElementAttributes().length).toBe(1);
    expect(count._getTextNodes().length).toBe(1);


    element = Array.from(count._getTextNodes())[0]
    expect(element.textContent).toBe('1');
  });

  it('text node and deps should be deleted properly', async () => {
    count.setValue(4);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(count.getSideEffects().size).toBe(1);
    expect(count._getElementAttributes().length).toBe(0);
    expect(count._getTextNodes().length).toBe(0);
  });
});
