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
      <div className="navbar-usericon">
      <button
        ref={userButtonRef}
        type="button"
        className="navbar-account"
        onClick={handleUserIconClick}
      >
        <FaUser size={25} />
      </button>
      </div>
      <div className="navbar-links">
     <Link to = "/Groups" className="nav-link">Groups</Link>
      {/* <Link to = "/Favorites" className="nav-link">Favorites</Link> */}
      </div>
    </nav>
  );
}

export default NavBar;
