import Venta from '../../../src/index.ts'
import { Button } from './_components/button.jsx'
import Layout from './layout.jsx'

function Home() {
  const inputState = Venta.useState('')
  const listState = Venta.useState(['hello'])

  const handleAddToList = () => {
    listState.setValue([...listState.value, inputState.value])
    inputState.setValue('')
  }

  return (
    <Layout>
      <div>
        <h1>
          Todos
        </h1>
        <input type="text" value={inputState} onInput={(e) => {
          inputState.setValue(e.target.value)
        }} />
        <Button onClick={handleAddToList}>Add To List</Button>

        <div style="margin-top: 20px;">
          {listState.value.map((todo, index) => (
            <div key={todo} style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #333; margin-top: 10px;">
              <p>{todo}</p>
              <Button onClick={() => listState.setValue(listState.value.filter((_, i) => i !== index))}>Remove</Button>
            </div>
          ))
          }
        </div>
      </div>
    </Layout>
  )
}


export default Home 
