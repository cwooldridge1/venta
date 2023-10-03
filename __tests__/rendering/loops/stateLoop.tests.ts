/**
 * @jest-environment jsdom
 */
import { VentaState, useState } from "../../../src"
import { renderLoop, renderVentaNode } from "../../../src/utils";

describe('looped renders work with state and set state calls', () => {
  let arr: VentaState, elements: Array<HTMLElement>, parent: HTMLElement;

  const isLoopedRenderCorrect = ((parent: HTMLElement, arr: Array<any>) => {
    expect(parent.children.length).toBe(arr.length)
    Array.from(parent.children).forEach((child, index) => {
      const expectedValue = arr[index].toString()
      expect(child.textContent).toBe(expectedValue)
      expect(child.getAttribute('key')).toBe(expectedValue)
    });
  })
  const wasMinimalRerender = (parent: HTMLElement, oldContent: Element[], expectNewElementCount: number) => {
    let newCount = 0;
    Array.from(parent.children).forEach((child) => {
      if (!oldContent.includes(child)) newCount++
    })
    expect(newCount).toBe(expectNewElementCount)

  }


  beforeAll(() => {
    arr = useState([1, 2, 3])
    const func = () => arr.value.map((item: number) => renderVentaNode('div', { key: item }, item))
    elements = renderLoop(func, arr) as HTMLElement[]

    parent = document.createElement('div')
    parent.append(...elements)
    document.body.appendChild(parent)
  })

  it('should render the correct state initially', () => {
    isLoopedRenderCorrect(parent, arr.value)
  })


  it('should update the correct state when the array is changed', () => {
    arr.setValue([...arr.value, arr.value.length + 1])
    isLoopedRenderCorrect(parent, arr.value)
    wasMinimalRerender(parent, elements, 1)
    elements = Array.from(parent.children) as HTMLElement[]
  })


  it('should update the correct state when the array is changed', () => {
    const newArr = [...arr.value]
    newArr.splice(1, 0, arr.value.length + 1)
    arr.setValue(newArr)
    isLoopedRenderCorrect(parent, arr.value)
    wasMinimalRerender(parent, elements, 1)
    elements = Array.from(parent.children) as HTMLElement[]
  })

  it('should update the correct when order changes but not content', () => {
    const newArr = [...arr.value].sort()
    arr.setValue(newArr)
    isLoopedRenderCorrect(parent, arr.value)
    wasMinimalRerender(parent, elements, 0)
  })

  it('insert at start', () => {
    arr.value.splice(0, 0, 0)
    arr.setValue(arr.value)
    isLoopedRenderCorrect(parent, arr.value)
    wasMinimalRerender(parent, elements, 1)
  })

})
