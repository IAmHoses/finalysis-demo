import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from './context/AuthContext';
import './index.css'
import App from './App'
import LoginPage from './pages/LoginPage';
import QuoteStock from './pages/QuoteStock';

function LoginPageWithAuth() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

function QuoteStockWithAuth() {
  return (
    <AuthProvider>
      <QuoteStock />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <LoginPageWithAuth />,
  },
  {
    path: "/quote-stock",
    element: <QuoteStockWithAuth />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
