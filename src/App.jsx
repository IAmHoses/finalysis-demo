import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      {/* Route management or conditional layout goes here */}
      <LoginPage />
    </AuthProvider>
  );
}

export default App;
