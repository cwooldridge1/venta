import { describe, expect, it, beforeAll, vi } from 'vitest'
import {
  componentReferenceMap,
  componentStateMap,
  elementMap, getComponentId, stateMap,
} from '../../../src/state';
import {
  registerConditional,
  renderVentaNode,
} from '../../../src/utils';
import { useState, VentaState, Props, useEffect } from '../../../src';


const Component = ({ children }: Props) => {
  const state = useState(0);
  useEffect(() => {
    console.log('mount')
    return () => {
      console.log('dismount')
    }
  }, [])
  return renderVentaNode('div', {}, children)
}

const getSpanText = (element: HTMLElement) => {
  return element.children.item(0)!.textContent
}


describe('conditional jsx render', () => {
  let count: VentaState<number>, element: HTMLElement;
  let componentId = getComponentId()

  beforeAll(() => {
    count = useState(0);

    const test = () => count.value > 2;

    const trueContent = () => renderVentaNode(Component, {}, renderVentaNode('span', {}, 'Count is Greater than 2'));
    const falseContent = () => renderVentaNode(Component, {}, renderVentaNode('span', {}, 'Count is Less than 2'));

    element = registerConditional(test, trueContent, falseContent, count) as HTMLElement;
    componentId = componentReferenceMap.get(element)!
    document.body.appendChild(element);
  });


  it('should render the correct conditional initially', () => {
    expect(count.getSideEffects().size).toBe(1);
    expect(elementMap.has(element)).toBe(true);

    expect(getSpanText(element)).toBe('Count is Less than 2');

    expect(stateMap.size).toBe(2)
    expect(componentStateMap.size).toBe(1)
    const componentState = componentStateMap.get(componentId)!

    expect(componentState.state.length).toBe(1)
    expect(componentState.unmountCallbacks.length).toBe(1)

    expect(elementMap.has(element)).toBe(true);
    expect(stateMap.size).toBe(2)
    expect(componentReferenceMap.get(element)).toBe(componentId)
  });

  it('should true condition render properly', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });


    count.setValue(3);
    element = document.querySelector('div')!;

    expect(getSpanText(element)).toBe('Count is Greater than 2');
    expect(logSpy.mock.calls[0][0]).toBe('mount'); //technically a new mount happens before clean ups are called
    expect(logSpy.mock.calls[1][0]).toBe('dismount');

    logSpy.mockRestore();

    expect(componentStateMap.size).toBe(1)
    componentId = componentReferenceMap.get(element)!
    expect(componentId).toBe(2)

    const componentState = componentStateMap.get(componentId)!
    expect(componentState.state.length).toBe(1)
    expect(componentState.unmountCallbacks.length).toBe(1)

    expect(elementMap.has(element)).toBe(true);
    expect(stateMap.size).toBe(2)
    expect(componentReferenceMap.get(element)).toBe(componentId)
  })

  it('state change of same test should not cause rerender', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(4);

    expect(element.textContent).toBe('Count is Greater than 2');
    expect(elementMap.has(element)).toBe(true);

    expect(logSpy.mock.calls.length).toBe(0);

    logSpy.mockRestore();
  })

  it('reversion to initial state cleans up properly', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(0);

    element = document.body.querySelector('div')!;
    expect(element.textContent).toBe('Count is Less than 2');

    expect(logSpy.mock.calls[0][0]).toBe('mount'); //technically a new mount happens before clean ups are called
    expect(logSpy.mock.calls[1][0]).toBe('dismount');

    logSpy.mockRestore();

    expect(componentStateMap.size).toBe(1)
    const componentState = componentStateMap.get(++componentId)!
    expect(componentState.state.length).toBe(1)
    expect(componentState.unmountCallbacks.length).toBe(1)

    expect(elementMap.has(element)).toBe(true);
    expect(stateMap.size).toBe(2)
    expect(componentReferenceMap.get(element)).toBe(componentId)
  })
});
