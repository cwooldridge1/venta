import Venta from '../../../src/index.ts'
import Navbar from './_components/navbar.jsx'


export default function Layout({ children }) {
  return (
    <main>
      <Navbar />
      {children}
    </main>
  )
}
