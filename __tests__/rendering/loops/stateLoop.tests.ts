/**
 * @jest-environment jsdom
 */
import { VentaState, useState } from "../../../src"
import { componentStateMap, elementMap } from "../../../src/state";
import { renderLoop, renderVentaNode } from "../../../src/utils";

const isLoopedRenderCorrect = ((parent: Element, arr: Array<any>, checkContent: boolean = true) => {
  if (!parent.children.length) return
  expect(parent.children.length).toBe(arr.length)
  Array.from(parent.children).forEach((child, index) => {

    const expectedValue = arr[index].toString()
    if (checkContent) expect(child.textContent).toBe(expectedValue)
    expect(child.getAttribute('key')).toBe(expectedValue)
  });
})

const wasMinimalRerender = (parent: Element, oldContent: Element[], expectNewElementCount: number) => {
  let newCount = 0;

  if (parent.children.length) {

    Array.from(parent.children).forEach((child) => {
      if (!oldContent.includes(child)) newCount++
    })

  }
  expect(newCount).toBe(expectNewElementCount)

}
describe('looped renders work with state and set state calls', () => {
  let arr: VentaState, elements: Array<HTMLElement>, parent: HTMLElement;
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


describe('test for when initial content is empty', () => {
  let arr: VentaState, elements: Array<HTMLElement>, parent: HTMLElement;
  beforeAll(() => {
    arr = useState([])
    const func = () => arr.value.map((item: number) => renderVentaNode('div', { key: item }, item))
    elements = []
    parent = document.createElement('div')
    parent.append(renderLoop(func, arr) as Node)
    document.body.appendChild(parent)
  })

  it('should render the correct state initially', () => {
    isLoopedRenderCorrect(parent, arr.value)
  })

  it('should update the correct state when the array is changed', () => {
    arr.setValue([arr.value.length + 1])
    isLoopedRenderCorrect(parent, arr.value)
    wasMinimalRerender(parent, elements, 1)
    elements = Array.from(parent.children) as HTMLElement[]
  })
})


describe('test for when dep is not state', () => {
  let arr: number[], elements: Array<HTMLElement>, parent: HTMLElement;
  beforeAll(() => {
    arr = [1, 2, 3]
    const func = () => arr.map((item: number) => renderVentaNode('div', { key: item }, item))
    elements = renderLoop(func, arr) as HTMLElement[]

    parent = document.createElement('div')
    parent.append(...elements)
    document.body.appendChild(parent)

  })

  it('should render the correct state initially', () => {
    isLoopedRenderCorrect(parent, arr)
  })
})


describe('test for when initial content is empty', () => {
  let arr: VentaState, elements: Array<HTMLElement>, parent: HTMLElement;
  beforeAll(() => {
    arr = useState([])
    const func = () => arr.value.map((item: number) => renderVentaNode('div', { key: item }, item))
    elements = []
    parent = document.createElement('div')
    parent.append(renderLoop(func, arr) as Node)
    document.body.appendChild(parent)
  })

  it('should render the correct state initially', () => {
    isLoopedRenderCorrect(parent, arr.value)
  })

  it('should update the correct state when the array is changed', () => {
    arr.setValue([arr.value.length + 1])
    isLoopedRenderCorrect(parent, arr.value)
    wasMinimalRerender(parent, elements, 1)
    elements = Array.from(parent.children) as HTMLElement[]
  })
})



describe('nested loops', () => {
  let arr: VentaState, elements: Array<HTMLElement>, parent: HTMLElement;
  beforeAll(() => {
    arr = useState([[1, 2], [3, 4]])
    const func = () => arr.value.map((item: number[], index: number) =>
      renderVentaNode("div", {
        key: index
      },
        renderLoop(() => item.map((val) => renderVentaNode("div", { key: val }, val)), item))
    )

    elements = renderLoop(func, arr) as HTMLElement[]

    parent = document.createElement('div')
    parent.append(...elements)
    document.body.appendChild(parent)
  })

  it('nested content should match initially', () => {
    elements.forEach((elem, index) => {
      isLoopedRenderCorrect(elem, arr.value[index])
    })
  })

  it('should update the correct state when the array is changed', () => {
    arr.setValue([...arr.value, [5, 6]])
    Array.from(parent.children).forEach((elem, index) => {
      isLoopedRenderCorrect(elem, arr.value[index])
      wasMinimalRerender(elem, index === 2 ? [] : Array.from(elements[index].children), index === 2 ? 2 : 0)
    })
    wasMinimalRerender(parent, elements, 1)
    elements = Array.from(parent.children) as HTMLElement[]
  })
})


describe('loop with with stateful child variables - dep check', () => {
  let arr: VentaState, count: VentaState, elements: Array<HTMLElement>, parent: HTMLElement;
  beforeAll(() => {
    arr = useState([1, 2, 3])
    count = useState(0)
    elementMap.clear()
    const func = () => arr.value.map((item: number) => renderVentaNode('div', { key: item }, count))
    elements = renderLoop(func, arr, count) as HTMLElement[]

    parent = document.createElement('div')
    parent.append(...elements)
    document.body.appendChild(parent)
  })

  it('should render the correct state initially', () => {
    isLoopedRenderCorrect(parent, arr.value, false)
    let i = 0
    count.getElements().forEach((elem) => expect(elem).toBe(elements[i++]))
    expect(count.getSideEffects().size).toBe(0)
    expect(elementMap.size).toBe(arr.value.length)
    expect(componentStateMap.size).toBe(0)
  })


  it('when state is changed the inner value should change', () => {
    count.setValue(1);
    elements.forEach(elem => expect(elem.textContent).toBe(count.value.toString()))
    expect(elementMap.size).toBe(arr.value.length)
  })

  it('when an element is addeded only needed deps get added', () => {
    arr.value.pop()
    arr.setValue(arr.value)
    expect(elementMap.size).toBe(arr.value.length)
    expect(count.getElements().size).toBe(arr.value.length)
    expect(count.getSideEffects().size).toBe(0)
  })
})
