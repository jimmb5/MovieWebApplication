import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import NavBar from "./NavBar";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import UserModal from "./modals/UserModal";

import { useAuth } from "../contexts/AuthContext";
import "./modals/Modal.css";
import "./Layout.css";
import "./Footer.css";
import Footer from "./Footer.jsx";

function Layout() {
  const [IsLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const mouseDownTarget = useRef(null);
  const userButtonRef = useRef(null);
  const { user } = useAuth();
  const location = useLocation();
  const [showRegister, setShowRegister] = useState(false);

// Add this line right after getting user from context:
  console.log("Logged-in user in Layout:", user);

  // avaa login jos tullaan protected routesta
  useEffect(() => {
    if (location.state?.openLogin && !user) {
      setIsLoginModalOpen(true);
      // state pois
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user]);

  const handleUserIconClick = () => {
    if (user) {
      // Jos käyttäjä on kirjautunut, avaa user modal
      setIsUserDropdownOpen(true);
    } else {
      // Jos käyttäjä ei ole kirjautunut, avaa login modal
      setIsLoginModalOpen(true);
    }
  };
  
  return (
    <>
      <NavBar 
      onUserIconClick={handleUserIconClick} 
      userButtonRef={userButtonRef}
      />
      <div className="layout-content">
        <Outlet />
      </div>
      <Footer />
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
