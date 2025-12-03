import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import "./Profile.css";

function Profile() {
  const { username } = useParams();
  const { user } = useAuth();

  return (
    <main className="profile-page">
        <div className="profile-content">
      <ProfileSidebar username={username} />
    </div>
    </main>
  );
}

export default Profile;

