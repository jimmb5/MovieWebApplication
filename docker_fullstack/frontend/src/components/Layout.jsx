import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import UserModal from "./UserModal";
import { useAuth } from "../contexts/AuthContext";
import "./Modal.css";
import "./Layout.css";

function Layout() {
  const [IsLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const mouseDownTarget = useRef(null);
  const userButtonRef = useRef(null);
  const { user } = useAuth();
  const location = useLocation();
  const [showRegister, setShowRegister] = useState(false);

  // avaa login jos tullaan protected routesta
  useEffect(() => {
    if (location.state?.openLogin && !user) {
      setIsLoginModalOpen(true);
      // state pois
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user]);
  
  return (
    <>
      <NavBar/>
      <div className="layout-content">
        <Outlet />
      </div>
      {(IsLoginModalOpen || showRegister) && !user && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            mouseDownTarget.current = e.target;
          }}
          onMouseUp={(e) => {
            if (
              mouseDownTarget.current === e.target &&
              e.target.classList.contains("modal-overlay")
            ) {
              setIsLoginModalOpen(false);
              setShowRegister(false);
            }
            mouseDownTarget.current = null;
          }}
        >
          {IsLoginModalOpen && (
            <LoginModal
              switchToRegister={() => {
                setIsLoginModalOpen(false);
                setShowRegister(true);
              }}
              isOpen={IsLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
            />
          )}
          {showRegister && (
            <RegisterModal
              isOpen={showRegister}
              onClose={() => setShowRegister(false)}
              switchToLogin={() => {
                setShowRegister(false);
                setIsLoginModalOpen(true);
              }}
            />
          )}
        </div>
      )}
      {isUserDropdownOpen && user && (
        <UserModal
          onClose={() => setIsUserDropdownOpen(false)}
          buttonRef={userButtonRef}
        />
      )}
    </>
  );
}

export default Layout;
