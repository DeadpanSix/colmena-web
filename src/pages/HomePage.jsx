import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome to Colmena, {user.name}</h1>
      <p>Use the sidebar to navigate to your documents or the dashboard.</p>
    </div>
  );
}
