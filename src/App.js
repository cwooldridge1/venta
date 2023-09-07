import Button from './Button.js'
import { useState } from './Venta.js'

const App = () => {
  const state = useState(0)
  const callback = () => {
    console.log('callback', state)
    state.setState(state.state + 1)
  }

  return (
    <div>
      <div>
        <Button onClick={callback} name={state}>
          Click Count = {state}
        </Button>
      </div>
    </div>
  )
}

export default App
