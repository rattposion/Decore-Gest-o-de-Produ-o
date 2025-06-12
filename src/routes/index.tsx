import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Inventory from '../pages/Inventory';
import Production from '../pages/Production';
import Reports from '../pages/Reports';
import Employees from '../pages/Employees';
import Equipment from '../pages/Equipment';
import Register from '../pages/Register';

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
      />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="employees"
          element={
            <PrivateRoute adminOnly>
              <Employees />
            </PrivateRoute>
          }
        />
        <Route
          path="equipment"
          element={
            <PrivateRoute adminOnly>
              <Equipment />
            </PrivateRoute>
          }
        />
        <Route path="inventory" element={<Inventory />} />
        <Route path="production" element={<Production />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Redireciona qualquer outra rota para o dashboard ou login */}
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
};

export default AppRoutes; 