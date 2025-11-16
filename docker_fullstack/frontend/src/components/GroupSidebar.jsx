import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaUsers, FaInfoCircle, FaUserFriends, FaCog } from "react-icons/fa";
import "./GroupSidebar.css";

function GroupSidebar({ group }) {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!group) {
    return null;
  }

  return (
    <div className="group-sidebar">
      <div className="group-sidebar-avatar">
        <FaUsers size={40} />
      </div>
      <div className="group-sidebar-group-info">
        <h2 className="group-sidebar-name">{group.name}</h2>
        <p className="group-sidebar-subtitle">
          {group.member_count !== undefined ? `${group.member_count} members` : "Group"}
        </p>
      </div>
      <div className="group-sidebar-buttons">
        <button 
          className={`group-sidebar-button ${isActive(`/groups/${groupId}`) ? 'active' : ''}`}
          onClick={() => navigate(`/groups/${groupId}`)}
        >
          <FaInfoCircle /> Overview
        </button>
        <button 
          className={`group-sidebar-button ${isActive(`/groups/${groupId}/members`) ? 'active' : ''}`}
          onClick={() => navigate(`/groups/${groupId}/members`)}
        >
          <FaUserFriends /> Members
        </button>
        <button 
          className={`group-sidebar-button ${isActive(`/groups/${groupId}/settings`) ? 'active' : ''}`}
          onClick={() => navigate(`/groups/${groupId}/settings`)}
        >
          <FaCog /> Settings
        </button>
      </div>
    </div>
  );
}

export default GroupSidebar;
