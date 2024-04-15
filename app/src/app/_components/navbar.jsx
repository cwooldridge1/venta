import { Link } from '../../../../lib/routing/index.jsx';

function Navbar() {

  return (
    <nav style="display: flex; justify-content: space-around; align-items: center; background-color: #333; color: white; padding: 10px; margin:0">
      <Link href="/" style="color: white; text-decoration: none; padding: 10px; font-weight: bold;">Home</Link>
      <Link href="/profile" style="color: white; text-decoration: none; padding: 10px; font-weight: bold;">Profile</Link>
    </nav>
  );
}

export default Navbar;
