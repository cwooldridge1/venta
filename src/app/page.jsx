import { useState, useEffect, useMemo } from 'venta'
import { Button } from './_components/button.jsx'
import Layout from './_components/layout.jsx'

export function Home() {
  const inputState = useState(null)
  const listState = useState([])

  const handleAddToList = () => {
    listState.setValue([...listState.value, inputState.value])
    inputState.setValue('')
  }

  const todoCount = useMemo(() => listState.value.length, [listState])

  useEffect(() => {
    console.log('Component mounted')
    return () => {
      console.log('Component unmounted')
    }
  }, [])

  return (
    <Layout>
      <div>
        <h1>
          Todos
        </h1>
        <input type="text" value={inputState} onInput={(e) => {
          inputState.setValue(e.target.value)
        }} />

        {inputState.value ?? (listState.value.length > 1 ? 'length greater than 1' : 'count is less than 2')}
        <Button onClick={handleAddToList}>Add To List</Button>
        <Button onClick={() => inputState.setValue(null)}>Set NUll</Button>
        {inputState.value ?? <p>waiting for input</p>}

        <div style="margin-top: 20px;">
          {todoCount.value === 0 ? <p>No todos yet</p> : <p>You have {todoCount} todos</p>}
          {listState.value.map((todo) => (
            <div key={todo} style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #333; margin-top: 10px;">
              <p>{todo}</p>
              <Button onClick={() => {
                listState.setValue(listState.value.filter((node) => node !== todo))
              }}>Remove</Button>
            </div>
          ))
          }
        </div>
      </div>
    </Layout>
  )
}

export default Home 
