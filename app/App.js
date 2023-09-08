import Button from './Button.js'
import { useEffect, useState, useMemo } from '../src/hooks'
const App = () => {
  const count = useState(0)
  const callback = () => {
    count.setState(count.state + 1)
  }
  const doubleCount = useMemo(() => count.state * 2, [count])

  useEffect(() => {
    console.log('useffect called', doubleCount.state)
  }, [doubleCount])

  return (
    <div>
      <div>
        <Button onClick={callback} name={doubleCount}>
          Click Count: {count}
        </Button>
      </div>
    </div>
  )
}

export default App
