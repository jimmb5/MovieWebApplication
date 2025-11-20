import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import "./Favorites.css";

function Favorites() {
  const { username } = useParams();
  const { user } = useAuth();

  return (
    <main className="favorites-page">
      <div className="favorites-content">
        <ProfileSidebar username={username} />
      </div>
    </main>
  );
}

export default Favorites;

