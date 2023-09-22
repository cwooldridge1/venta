import { useEffect, useState } from '../src/hooks'
const Card = ({ children }) => {
  useEffect(() => {
    console.log('card mounted')
    return () => {
      console.log('card unmounted')
    }
  }, [])
  const state = useState(0)

  return (
    <div style="padding: 1rem; border: 1px solid black;" name='card'>
      {children}
    </div>
  )
}
export default Card;
