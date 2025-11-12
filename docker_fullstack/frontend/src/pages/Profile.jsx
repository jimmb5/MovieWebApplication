import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Profile() {
  const { username } = useParams();
  const { user } = useAuth();

  return (
    <div>
    </div>
  );
}

export default Profile;

