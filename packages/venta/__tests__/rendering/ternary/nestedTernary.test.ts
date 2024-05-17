import { describe, expect, it, beforeAll, vi } from 'vitest'
import {
  createComponent,
  createDeletionObserver,
  createElement,
  registerConditional,
  renderConditional,
} from '../../../src/utils';
import { useState, useEffect } from '../../../src';
import { getSharedState } from '../../../src/utils/enviroment-helpers';
import { COMPONENT_ID_ATTRIBUTE } from '../../../src/constants';


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
  return createElement('div', {}, children)
}


const getSpanText = (element: HTMLElement) => {
  return element.children.item(0)!.textContent
}


const deletionObserver = createDeletionObserver()

const sharedState = getSharedState();

describe('conditional jsx render', () => {
  let count: VentaState<number>, element: HTMLElement;

  beforeAll(() => {
    count = useState(0);

    const test = () => count.value > 2;


    const trueNestedContent = () => createComponent(Component, null, [createElement('span', {}, 'Count is Greater than 5')]);
    const falseNestedContent = () => createComponent(Component, null, [createElement('span', {}, 'Count is Less than 5')]);

    const countIs0Content = () => createComponent(Component, null, [createElement('span', {}, 'Count is 0')]);

    const trueConditional = () => renderConditional(() => count.value > 5, trueNestedContent, falseNestedContent, 1)

    const falseConditional = () => renderConditional(() => count.value === 0, countIs0Content, () => createElement('span', {}, 'Count less than 0'), 2)

    element = registerConditional(test, trueConditional, falseConditional, count) as HTMLElement;
    document.body.appendChild(element);
    const config = { childList: true, subtree: true }
    deletionObserver.observe(document.body, config)
  });


  it('should render the correct conditional initially', () => {
    expect(count.getSideEffects().size).toBe(1);

    element = document.body.querySelector('div')!;
    expect(getSpanText(element)).toBe('Count is 0');

    expect(sharedState.VentaAppState.componentCleanUpMap.size).toBe(1)
    expect(sharedState.VentaAppState.elementToComponentId.size).toBe(0)
    const id = element[COMPONENT_ID_ATTRIBUTE]
    expect(sharedState.VentaAppState.componentCleanUpMap.get(id)!.length).toBe(1)
  });

  it('true then false works', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(3);

    element = document.body.querySelector('div')!;
    expect(getSpanText(element)).toBe('Count is Less than 5');

    expect(logSpy.mock.calls[0][0]).toBe('mount'); //technically a new mount happens before clean ups are called
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(logSpy.mock.calls[1][0]).toBe('dismount');

    logSpy.mockRestore();

    expect(sharedState.VentaAppState.componentCleanUpMap.size).toBe(1)
    expect(sharedState.VentaAppState.elementToComponentId.size).toBe(0)
    const id = element[COMPONENT_ID_ATTRIBUTE]
    expect(sharedState.VentaAppState.componentCleanUpMap.get(id)!.length).toBe(1)
  })

  it('state change of same test should not cause rerender', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(4);
    expect(logSpy.mock.calls.length).toBe(0);

    logSpy.mockRestore();
  })

  it('true and true', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(6);

    element = document.body.querySelector('div')!;
    expect(getSpanText(element)).toBe('Count is Greater than 5');

    expect(logSpy.mock.calls[0][0]).toBe('mount'); //technically a new mount happens before clean ups are called


    await new Promise(resolve => setTimeout(resolve, 200));
    expect(logSpy.mock.calls[1][0]).toBe('dismount');

    logSpy.mockRestore();

    expect(sharedState.VentaAppState.componentCleanUpMap.size).toBe(1)
    expect(sharedState.VentaAppState.elementToComponentId.size).toBe(0)
    const id = element[COMPONENT_ID_ATTRIBUTE]
    expect(sharedState.VentaAppState.componentCleanUpMap.get(id)!.length).toBe(1)
  })

  it('reversion to initial state cleans up properly', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

    count.setValue(0);

    element = document.body.querySelector('div')!;
    expect(getSpanText(element)).toBe('Count is 0');

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(logSpy.mock.calls[0][0]).toBe('dismount');

    logSpy.mockRestore();

    expect(sharedState.VentaAppState.componentCleanUpMap.size).toBe(0)
    expect(sharedState.VentaAppState.elementToComponentId.size).toBe(0)
    const id = element[COMPONENT_ID_ATTRIBUTE]
  })
});
