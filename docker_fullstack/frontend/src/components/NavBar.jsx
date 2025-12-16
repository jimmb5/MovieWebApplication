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
          <img src="./mw_logo.png" alt="" width="200px" />
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/movies" className="nav-link">
          Movies
        </Link>
        <Link to="/groups" className="nav-link">
          Groups
        </Link>
        {/* <Link to = "/Favorites" className="nav-link">Favorites</Link> */}
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
    </nav>
  );
}

export default NavBar;
