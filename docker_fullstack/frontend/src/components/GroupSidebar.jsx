import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaUsers, FaInfoCircle, FaUserFriends, FaCog, FaUserPlus, FaSignOutAlt } from "react-icons/fa";
import "./GroupSidebar.css";
import { useGroup } from "../contexts/GroupContext";
import ConfirmationModal from "./ConfirmationModal";

function GroupSidebar({ group }) {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { leaveGroup } = useGroup();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLeaveGroupClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmLeave = async () => {
    const success = await leaveGroup();
    if (success) {
      navigate("/groups");
    }
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
          className={`group-sidebar-button ${isActive(`/groups/${groupId}/pending-requests`) ? 'active' : ''}`}
          onClick={() => navigate(`/groups/${groupId}/pending-requests`)}
        >
          <FaUserPlus /> Pending requests
        </button>
        <button 
          className={`group-sidebar-button ${isActive(`/groups/${groupId}/settings`) ? 'active' : ''}`}
          onClick={() => navigate(`/groups/${groupId}/settings`)}
        >
          <FaCog /> Settings
        </button>
        <button 
          className="group-sidebar-button group-sidebar-leave-button"
          onClick={handleLeaveGroupClick}
        >
          <FaSignOutAlt /> Leave group
        </button>
      </div>
      
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmLeave}
        title="Leave Group?"
        message={`Are you sure you want to leave "${group.name}"? You will be accepted to the group again.`}
        confirmText="Leave Group"
        cancelText="Cancel"
        variant="delete"
      />
    </div>
  );
}

export default GroupSidebar;
