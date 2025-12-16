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
      <div className="navbar-logo">
        <Link to="/">
          <img src="/mw_logo_wide_orange.png" alt="MovieWeb" width="200px" />
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
        <div
          className="navbar-usericon"
          ref={userButtonRef}
          type="button"
          onClick={handleUserIconClick}
        >
          <FaUser size={25} color="#d1954b" />
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
