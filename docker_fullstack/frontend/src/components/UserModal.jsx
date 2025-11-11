import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import "./Modal.css";

function UserModal({ onClose, buttonRef }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef?.current && dropdownRef?.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const dropdown = dropdownRef.current;
        
        dropdown.style.top = `${buttonRect.bottom + 8}px`;
        dropdown.style.right = `${window.innerWidth - buttonRect.right}px`;
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

  return (
    <div ref={dropdownRef} className="user-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="user-dropdown-header">
        <div className="user-dropdown-icon">
          <FaUser size={20} />
        </div>
        <div className="user-dropdown-info">
          <div className="user-dropdown-username">{user?.username}</div>
        </div>
      </div>
      <div className="user-dropdown-divider"></div>
      <button className="user-dropdown-item logout-button" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </div>
  );
}

export default UserModal;

