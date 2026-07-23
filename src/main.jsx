import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from './context/AuthContext';
import './index.css'
import App from './App'
import LoginPage from './pages/LoginPage';
import StockLookupPage from './pages/StockLookupPage';

// 1. Wrapped pages with AuthProvider for context access
function LoginPageWithAuth() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

function StockLookupPageWithAuth() {
  return (
    <AuthProvider>
      <StockLookupPage />
    </AuthProvider>
  );
}

// 2. Client-Side Routes
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
    path: "/stock-lookup",
    element: < StockLookupPageWithAuth />,
  },
  // Test route to check if the router is working correctly. This route can be removed later.
  {
    path: "/about",
    element: <div>About Page Content</div>,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
