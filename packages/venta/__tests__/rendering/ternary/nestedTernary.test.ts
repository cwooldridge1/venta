import { describe, expect, it, beforeAll, vi } from 'vitest'
import {
  componentReferenceMap,
  componentStateMap,
  elementMap, getComponentId, stateMap,
} from '../../../src/state';
import {
  registerConditional,
  renderVentaNode,
  renderConditional,
} from '../../../src/utils';
import { useState, useEffect } from '../../../src';


type VentaState<T> = Venta.VentaState<T>
type Props = Venta.Props

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


    const trueNestedContent = () => renderVentaNode(Component, {}, renderVentaNode('span', {}, 'Count is Greater than 5'));
    const falseNestedContent = () => renderVentaNode(Component, {}, renderVentaNode('span', {}, 'Count is Less than 5'));

    const countIs0Content = () => renderVentaNode(Component, {}, renderVentaNode('span', {}, 'Count is 0'));

    const trueConditional = () => renderConditional(() => count.value > 5, trueNestedContent, falseNestedContent, 1)

    const falseConditional = () => renderConditional(() => count.value === 0, countIs0Content, () => renderVentaNode('span', {}, 'Count less than 0'), 2)

    element = registerConditional(test, trueConditional, falseConditional, count) as HTMLElement;
    document.body.appendChild(element);
  });


  it('should render the correct conditional initially', () => {
    componentId = getComponentId()
    expect(count.getSideEffects().size).toBe(1);
    expect(elementMap.has(element)).toBe(true);

    element = document.body.querySelector('div')!;
    expect(getSpanText(element)).toBe('Count is 0');

    const componentState = componentStateMap.get(componentId)!
    expect(componentState.state.length).toBe(1)
    expect(componentState.unmountCallbacks.length).toBe(1)

    expect(elementMap.has(element)).toBe(true);
    expect(stateMap.size).toBe(2)
    expect(elementMap.size).toBe(2);
    expect(componentReferenceMap.get(element)).toBe(componentId)
  });

  it('true then false works', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(3);

    element = document.body.querySelector('div')!;
    expect(getSpanText(element)).toBe('Count is Less than 5');

    expect(logSpy.mock.calls[0][0]).toBe('mount'); //technically a new mount happens before clean ups are called
    expect(logSpy.mock.calls[1][0]).toBe('dismount');

    logSpy.mockRestore();

    expect(componentStateMap.size).toBe(1)
    const componentState = componentStateMap.get(++componentId)!
    expect(componentState.state.length).toBe(1)
    expect(componentState.unmountCallbacks.length).toBe(1)

    expect(elementMap.has(element)).toBe(true);
    expect(stateMap.size).toBe(2)
    expect(elementMap.size).toBe(2);
    expect(componentReferenceMap.get(element)).toBe(componentId)
  })

  it('state change of same test should not cause rerender', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(4);

    expect(element.textContent).toBe('Count is Less than 5');
    expect(elementMap.has(element)).toBe(true);

    expect(logSpy.mock.calls.length).toBe(0);

    logSpy.mockRestore();
  })

  it('true and true', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(6);

    element = document.body.querySelector('div')!;
    expect(getSpanText(element)).toBe('Count is Greater than 5');

    expect(logSpy.mock.calls[0][0]).toBe('mount'); //technically a new mount happens before clean ups are called
    expect(logSpy.mock.calls[1][0]).toBe('dismount');

    logSpy.mockRestore();

    expect(componentStateMap.size).toBe(1)
    const componentState = componentStateMap.get(++componentId)!
    expect(componentState.state.length).toBe(1)
    expect(componentState.unmountCallbacks.length).toBe(1)

    expect(elementMap.has(element)).toBe(true);
    expect(stateMap.size).toBe(2)
    expect(elementMap.size).toBe(2);
    expect(componentReferenceMap.get(element)).toBe(componentId)
  })

  it('reversion to initial state cleans up properly', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(0);

    element = document.body.querySelector('div')!;
    expect(getSpanText(element)).toBe('Count is 0');

    expect(logSpy.mock.calls[0][0]).toBe('mount'); //technically a new mount happens before clean ups are called
    expect(logSpy.mock.calls[1][0]).toBe('dismount');

    logSpy.mockRestore();

    expect(componentStateMap.size).toBe(1)
    const componentState = componentStateMap.get(++componentId)!
    expect(componentState.state.length).toBe(1)
    expect(componentState.unmountCallbacks.length).toBe(1)

    expect(elementMap.has(element)).toBe(true);
    expect(stateMap.size).toBe(2)
    expect(elementMap.size).toBe(2);
    expect(componentReferenceMap.get(element)).toBe(componentId)
  })

  it('switch to none stateful element ereases all deps', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(-1);

    element = document.body.querySelector('span')!;
    expect(element.textContent).toBe('Count less than 0');

    expect(logSpy.mock.calls[0][0]).toBe('dismount');

    logSpy.mockRestore();

    expect(componentStateMap.size).toBe(0)
    expect(elementMap.has(element)).toBe(true);
    expect(elementMap.size).toBe(1);
    expect(stateMap.size).toBe(1)
  })
});
