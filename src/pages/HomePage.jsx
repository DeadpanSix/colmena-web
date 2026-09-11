import { useAuth } from '../context/AuthContext';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Colmena, {user.name}</h1>
      <p className={styles.subtitle}>
        Use the sidebar to navigate to your documents or the dashboard.
      </p>
    </div>
  );
}
