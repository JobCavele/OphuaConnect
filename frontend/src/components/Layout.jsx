import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | 
        <Link to="/about">About</Link>
      </nav>
      <main>
        <Outlet /> {/* Aqui as páginas serão renderizadas */}
      </main>
      <footer>
        <p>© 2025 OphuaConnect</p>
      </footer>
    </div>
  );
}

export default Layout;