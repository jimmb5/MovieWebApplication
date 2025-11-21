import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./CardNav";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import UserModal from "./modals/UserModal";
import { useAuth } from "../contexts/AuthContext";
import "./modals/Modal.css";
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

  // Täällä olevat näkyy kaikilla sivuilla
  const items = [
    {
      label: "Movies",
      bgColor: "#212121",
      textColor: "#fff",
      links: [
        {
          label: "Top Rated",
          href: "/movies/top-rated",
          ariaLabel: "Top Rated Movies",
        },
        {
          label: "Popular",
          href: "/movies/popular",
          ariaLabel: "Popular Movies",
        },
        {
          label: "Trending",
          href: "/movies/trending",
          ariaLabel: "Trending Movies",
        },
      ],
    },
    {
      label: "TV Shows",
      bgColor: "#232323",
      textColor: "#fff",
      links: [
        {
          label: "Top Rated",
          href: "/tv-shows/top-rated",
          ariaLabel: "Top Rated TV Shows",
        },
        {
          label: "Popular",
          href: "/tv-shows/popular",
          ariaLabel: "Popular TV Shows",
        },
        {
          label: "Trending",
          href: "/tv-shows/trending",
          ariaLabel: "Trending TV Shows",
        },
      ],
    },
    {
      label: "Profile & Groups",
      bgColor: "#252525",
      textColor: "#fff",
      links: [
        { label: "Favorites", href: "/favorites", ariaLabel: "Favorites" },
        { label: "Groups", href: "/groups", ariaLabel: "Groups" },
        { label: "Settings", href: "/settings", ariaLabel: "Settings" },
      ],
    },
  ];

  return (
    <>
      <Navbar
        logo={"/logo.svg"}
        logoAlt="Logo"
        items={items}
        baseColor="#111111"
        menuColor="#fff"
        buttonBgColor="#111111"
        buttonTextColor="#fff"
        ease="power3.out"
        onUserIconClick={() => {
          if (user) {
            setIsUserDropdownOpen(!isUserDropdownOpen);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        userButtonRef={userButtonRef}
      />
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
