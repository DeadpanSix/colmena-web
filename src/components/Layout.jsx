import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div>
      <nav>
        <div>
          <Link to="/">Documents</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div>
          <span>{user.name} ({user.role})</span>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
