/**
 * @jest-environment jsdom
 */
import {
  componentReferenceMap,
  componentStateMap,
  elementMap, getComponentId, stateMap,
} from '../src/state';
import {
  registerConditional,
  renderVentaNode,
} from '../src/utils';
import { useState, VentaState, Props, useEffect } from '../src';
import { jest } from '@jest/globals';


const Component = ({ children }: Props) => {
  const state = useState(0);
  useEffect(() => {
    console.log('mount')
    return () => {
      console.log('dismount')
    }
  }, [])
  return children
}


describe('conditional jsx render', () => {
  let count: VentaState, element: HTMLElement;
  let componentId = getComponentId()

  beforeAll(() => {
    count = useState(0);

    const test = () => count.value > 2;

    const trueContent = () => renderVentaNode(Component, {}, renderVentaNode('span', {}, 'Count is Greater than 2'));
    const falseContent = () => renderVentaNode(Component, {}, renderVentaNode('span', {}, 'Count is Less than 2'));

    element = registerConditional(test, trueContent, falseContent, count);
    document.body.appendChild(element);
  });


  it('should render the correct conditional initially', () => {
    expect(count.conditionalElements.length).toBe(1);
    expect(elementMap.has(element)).toBe(true);

    element = document.body.querySelector('span')!;
    expect(element.textContent).toBe('Count is Less than 2');

    const componentState = componentStateMap.get(componentId)!
    expect(componentState.state.length).toBe(1)
    expect(componentState.unmountCallbacks.length).toBe(1)

    expect(elementMap.has(element)).toBe(true);
    expect(stateMap.size).toBe(2)
    expect(componentReferenceMap.get(element)).toBe(componentId)
  });

  it('should true condition render properly', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(3);

    element = document.body.querySelector('span')!;
    expect(element.textContent).toBe('Count is Greater than 2');

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

  it('state change of same test should not cause rerender', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(4);

    expect(element.textContent).toBe('Count is Greater than 2');
    expect(elementMap.has(element)).toBe(true);

    expect(logSpy.mock.calls.length).toBe(0);

    logSpy.mockRestore();
  })

  it('reversion to initial state cleans up properly', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(0);

    element = document.body.querySelector('span')!;
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
