import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { JSX } from 'react';

  function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth(); 

  
  if (isLoading) {
    return <div>Carregando...</div>; 
  }


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;