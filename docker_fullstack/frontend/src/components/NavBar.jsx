import { Link } from "react-router-dom";
import "./NavBar.css";
import { FaUser } from "react-icons/fa";

function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Movie app
        </Link>
      </div>
      <div ClassName="navbar-link"></div>
      {/* <Link to = "/" className="nav-link">Home</Link> */}

      <button
        type="button"
        className="navbar-account"
        onClick={() => {
          onUserIconClick();
        }}
      >
        <FaUser size={20} />
      </button>
    </nav>
  );
}

export default NavBar;
