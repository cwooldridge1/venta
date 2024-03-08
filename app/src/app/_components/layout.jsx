import Venta from '../../../../src/index.tsx';
import Navbar from './navbar.jsx'


export default function Layout({ children }) {
  return (
    <main>
      <Navbar />
      {children}
    </main>
  )
}
