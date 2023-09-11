import Button from './Button.js'
import Card from './Card.js'
import { useEffect, useState, useMemo } from '../src/hooks'
const App = () => {
  const count = useState(0)
  const callback = () => {
    count.setState(count.value + 1)
  }
  const doubleCount = useMemo(() => count.value * 2, [count])

  useEffect(() => {
    console.log('useffect called', doubleCount.value)
  }, [doubleCount])

  return (
    <div>
      <Button onClick={callback}>
        Click Count {count}
      </Button>
      <Button onClick={() => count.setState(0)}>
        Reset
      </Button>
      <div>
        {count.value >= 1 ? count.value > 3 ? <span>{count}</span> : <span>Not greater than 3</span> : <span>less than 1</span>}
      </div>
    </div>
  )
}

export default App
