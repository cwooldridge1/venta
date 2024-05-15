import { describe, expect, it, beforeAll } from 'vitest'
import { renderLoop, createElement } from "../../../src/utils";
import { VentaArrayState } from '../../../src/state';


const isLoopedRenderCorrect = ((parent: Element, arr: Array<any>, checkContent: boolean = true) => {
  expect(parent.childNodes.length).toBe(arr.length + 2) // because of the sandwich comments

  Array.from(parent.children).forEach((child, index) => {
    const expectedValue = arr[index].toString()
    if (checkContent) expect(child.textContent).toBe(expectedValue)
    expect(child.getAttribute('key')).toBe(expectedValue)
  });
})

const wasMinimalRerender = (parent: Element, oldContent: Node[], expectNewElementCount: number) => {
  let newCount = 0;

  if (parent.children.length) {
    Array.from(parent.children).forEach((child) => {
      if (!oldContent.includes(child)) {
        newCount++
      }
    })
  }
  expect(newCount).toBe(expectNewElementCount)

}

describe('looped renders work with state and set state calls', () => {
  let arr: VentaArrayState<number>, elements: (HTMLElement | Comment)[], parent: HTMLElement;
  beforeAll(() => {
    arr = new VentaArrayState(1, 2, 3)

    const func = (item: number) => {
      return createElement("div", {
        key: item
      }, item);
    };


    elements = renderLoop(func, arr)
    parent = document.createElement('div')
    parent.append(...elements)
    document.body.appendChild(parent)
  })

  it('should render the correct state initially', () => {
    isLoopedRenderCorrect(parent, arr.value())
  })


  it('should update the correct state when the array is changed', () => {
    arr.push(arr.value().length + 1)
    isLoopedRenderCorrect(parent, arr.value())
    wasMinimalRerender(parent, elements, 1)
    elements = Array.from(parent.children) as HTMLElement[]
  })

  it('should update the correct state when the array is changed', () => {
    arr.splice(1, 0, arr.value().length + 1)
    isLoopedRenderCorrect(parent, arr.value())
    wasMinimalRerender(parent, elements, 1)
    elements = Array.from(parent.children) as HTMLElement[]
  })

  it('should support swapping', () => {
    arr.swap(1, 3)
    isLoopedRenderCorrect(parent, arr.value())
    wasMinimalRerender(parent, elements, 0)
    elements = Array.from(parent.children) as HTMLElement[]
  })

  it('should supporting resetting', () => {
    arr.reset(9, 6, 7)
    isLoopedRenderCorrect(parent, arr.value())
    wasMinimalRerender(parent, elements, 3)
    elements = Array.from(parent.children) as HTMLElement[]
  })


  it('should update the correct when order changes but not content', () => {
    arr.sort()
    expect(arr.value()).toEqual([6, 7, 9])
    isLoopedRenderCorrect(parent, arr.value())
    wasMinimalRerender(parent, elements, 0)
  })

  it('insert at start', () => {
    arr.unshift(0)
    isLoopedRenderCorrect(parent, arr.value())
    wasMinimalRerender(parent, elements, 1)
  })

  it('should pop', () => {
    arr.pop()
    isLoopedRenderCorrect(parent, arr.value())
  })

  it('should clear', () => {
    arr.clear()
    isLoopedRenderCorrect(parent, [])
  })
})
