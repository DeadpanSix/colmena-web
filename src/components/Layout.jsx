import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div style={{ display: 'flex' }}>
      <nav style={{ display: 'flex', flexDirection: 'column', minWidth: '200px' }}>
        <div>
          <p>{user.name}</p>
          <p>{user.role}</p>
        </div>
        <button onClick={handleLogout}>Log out</button>
        <Link to="/documents">Documents</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
