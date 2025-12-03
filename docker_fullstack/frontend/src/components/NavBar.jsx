import { Link } from "react-router-dom";
import "./NavBar.css";
import { FaUser } from "react-icons/fa";

function NavBar({ onUserIconClick, userButtonRef }) {
  const handleUserIconClick = () => {
    if (onUserIconClick) {
      onUserIconClick();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Movie app
        </Link>
      </div>
      <div className="navbar-link"></div>
     <Link to = "/Groups" className="nav-link">Groups</Link>
      <Link to = "/Favorites" className="nav-link">Favorites</Link>
      <button
        ref={userButtonRef}
        type="button"
        className="navbar-account"
        onClick={handleUserIconClick}
      >
        <FaUser size={20} />
      </button>
    </nav>
  );
}

export default NavBar;
