import { useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaUsers, FaStar, FaCog } from "react-icons/fa";
import "./ProfileSidebar.css";

function ProfileSidebar({ username }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="profile-sidebar">
      <div className="profile-sidebar-avatar">
        <FaUserCircle size={40} />
      </div>
      <div className="profile-sidebar-user-info">
        <h2 className="profile-sidebar-username">{username}</h2>
        <p className="profile-sidebar-subtitle">Your account</p>
      </div>
      <div className="profile-sidebar-buttons">
        <button 
          className={`profile-sidebar-button ${isActive(`/${username}`) ? 'active' : ''}`} 
          onClick={() => navigate(`/${username}`)}
        >
          <FaUserCircle /> Profile
        </button>
        <button 
          className={`profile-sidebar-button ${isActive(`/${username}/groups`) ? 'active' : ''}`} 
          onClick={() => navigate(`/${username}/groups`)}
        >
          <FaUsers /> My groups
        </button>
        <button 
          className={`profile-sidebar-button ${isActive(`/${username}/favorites`) ? 'active' : ''}`} 
          onClick={() => navigate(`/${username}/favorites`)}
        >
          <FaStar /> Favorites
        </button>
        <button 
          className={`profile-sidebar-button ${isActive(`/${username}/settings`) ? 'active' : ''}`} 
          onClick={() => navigate(`/${username}/settings`)}
        >
          <FaCog /> Settings
        </button>
      </div>
    </div>
  );
}

export default ProfileSidebar;

