import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useToast } from "./ToastContext";
import { GroupProvider } from "./GroupContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();
  const { groupId } = useParams();

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

  // jos groupid:llinen reitti, annetaan group context
  if (groupId) {
    return (
      <GroupProvider>
        {children}
      </GroupProvider>
    );
  }
  
  return children;
}

export default ProtectedRoute;