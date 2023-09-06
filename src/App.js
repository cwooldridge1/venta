import { useState, useEffect, useMemo } from './Venta.js'

const App = () => {
  const [count, setCount] = useState(0)
  const countDoubled = useMemo(() => {
    console.log('useMemo called')
    return count * 2
  }, [count])

  useEffect(() => {
    console.log('useEffect called')

    return () => {
      console.log('useEffect cleanup')
    }
  }, [])


  return (
    <div>
      <div>
        <span style='margin-right:1rem'>
          Count:
          {count}
        </span >
        <span>
          Double Count:
          {countDoubled}
        </span>
      </div>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
    </div>
  )
}

export default App
