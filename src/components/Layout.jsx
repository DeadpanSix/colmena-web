import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div className={styles.wrapper}>
      <nav className={styles.sidebar}>
        <div className={styles.brand}>Colmena</div>

        <div className={styles.userInfo}>
          <p className={styles.userName}>{user.name}</p>
          <p className={styles.userRole}>{user.role}</p>
        </div>

        <div className={styles.nav}>
          <Link className={styles.navLink} to="/">Home</Link>
          <Link className={styles.navLink} to="/documents">Documents</Link>
          <Link className={styles.navLink} to="/dashboard">Dashboard</Link>
        </div>

        <button className={styles.logoutButton} onClick={handleLogout}>
          Log out
        </button>
      </nav>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
