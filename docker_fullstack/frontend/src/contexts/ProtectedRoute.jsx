import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "./ToastContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      addToast("You must be logged in to access this page", "error");
    }
  }, [loading, user, addToast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ openLogin: true, from: location }} replace />;
  }
  
  return children;
}

export default ProtectedRoute;