import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { FaUser, FaSignOutAlt, FaUserCircle, FaCog, FaUsers, FaStar } from "react-icons/fa";
import "./Modal.css";

function UserModal({ onClose, buttonRef }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef?.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        
        setPosition({
          top: buttonRect.bottom + 8,
          right: window.innerWidth - buttonRect.right,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, buttonRef]);

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Logged out successfully", "success");
      onClose();
    } catch (err) {
      addToast("Logout failed", "error");
    }
  };

  const handleProfile = () => {
    navigate(`/${user.username}`);
    onClose();
  };

  const handleGroups = () => {
    navigate(`/${user.username}/groups`);
    onClose();
  };

  const handleFavorites = () => {
    navigate(`/${user.username}/favorites`);
    onClose();
  };

  const handleSettings = () => {
    navigate(`/${user.username}/settings`);
    onClose();
  };

  return (
    <div 
      ref={dropdownRef} 
      className="user-dropdown" 
      onClick={(e) => e.stopPropagation()}
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      <div className="user-dropdown-header">
        <div className="user-dropdown-icon">
          <FaUser size={20} />
        </div>
        <div className="user-dropdown-info">
          <div className="user-dropdown-username">{user?.username}</div>
        </div>
      </div>
      <div className="user-dropdown-divider"></div>
      <button className="user-dropdown-item" onClick={handleProfile}>
        <FaUserCircle />
        <span>Profile</span>
      </button>
      <button className="user-dropdown-item" onClick={handleGroups}>
        <FaUsers />
        <span>My groups</span>
      </button>
      <button className="user-dropdown-item" onClick={handleFavorites}>
        <FaStar />
        <span>Favorites</span>
      </button>
      <div className="user-dropdown-divider"></div>
      <button className="user-dropdown-item" onClick={handleSettings}>
        <FaCog />
        <span>Settings</span>
      </button>
      <div className="user-dropdown-divider"></div>
      <button className="user-dropdown-item logout-button" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </div>
  );
}

export default UserModal;

