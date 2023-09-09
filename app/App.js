import Button from './Button.js'
import Card from './Card.js'
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
    <Card>
      <Button onClick={callback} name={doubleCount}>
        Click Count: {count}
      </Button>
      {count > 2 &&
        <Button onClick={callback} name={doubleCount}>
          Click Count: {count}
        </Button>
      }
    </Card>
  )
}

export default App
