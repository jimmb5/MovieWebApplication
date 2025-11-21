import { useState, useEffect, useRef } from "react";
import { FaEllipsisV } from "react-icons/fa";
import "./DropdownMenu.css";

function DropdownMenu({ items, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    if (item.closeOnClick !== false) {
      setIsOpen(false);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`dropdown-menu ${className}`} ref={menuRef}>
      <button
        className="dropdown-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        title="Options"
      >
        <FaEllipsisV />
      </button>
      {isOpen && (
        <div className="dropdown-menu-content">
          {items.map((item, index) => {
            if (item.separator) {
              return <div key={`separator-${index}`} className="dropdown-menu-separator" />;
            }
            
            return (
              <button
                key={item.id || index}
                onClick={() => handleItemClick(item)}
                type="button"
                className={item.danger ? "dropdown-menu-item-danger" : "dropdown-menu-item"}
                disabled={item.disabled}
              >
                {item.icon && <span className="dropdown-menu-icon">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;

