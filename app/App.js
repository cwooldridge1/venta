import Button from './Button.js'
import Card from './Card.js'
import { useEffect, useState, useMemo } from '../src/hooks'
const App = () => {
  const count = useState(0)
  const count2 = useState(0)
  const callback = () => {
    count.setState(count.value + 1)
  }
  const doubleCount = useMemo(() => count.value * 2, [count])

  useEffect(() => {
    console.log('useffect called', doubleCount.value)
  }, [doubleCount])

  return (
    <Card>
      <Button onClick={callback}>
        Click Count {count}
      </Button>
      <Button onClick={() => count.setState(1)}>
        Reset
      </Button>
      {/* <Button onClick={() => count2.setState(count2.value + 1)}> */}
      {/*   count 2 {count2} */}
      {/* </Button> */}
      {count.value >= 1 ? (count2.value >= 3 ? <Card>{count}</Card> : doubleCount.value > 4 ? <Card>doouble</Card> : <Card>Not greater than 3</Card>) : <span>less than 1</span>}

      {/* {count.value >= 1 ? <Card>greater than 1</Card> : <Card>less than 1</Card>} */}
    </Card>
  )
}

export default App
