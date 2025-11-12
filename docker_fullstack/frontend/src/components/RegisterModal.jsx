import { useState } from "react";
import { useToast } from "../contexts/ToastContext";
import { FaUser, FaLock, FaTimes, FaEnvelope } from "react-icons/fa";
import "./Modal.css";

function RegisterModal({ isOpen, onClose, switchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // salasanan validointi
    if (!password || !confirmPassword) {
      addToast("All password fields are required", "error");
      return;
    }

    if (password !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (password.length < 8) {
      addToast("Password must be at least 8 characters long", "error");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      addToast("Password must contain at least one uppercase letter", "error");
      return;
    }

    if (!/[0-9]/.test(password)) {
      addToast("Password must contain at least one number", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Registration failed");
      }

      const data = await res.json();
      addToast("Registration successful! Please log in.", "success");
      onClose();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={handleClose} aria-label="Close">
        <FaTimes />
      </button>

      <div className="modal-header">
        <div className="modal-icon">
          <FaUser size={32} />
        </div>
        <h2>Create Account</h2>
        <p className="modal-subtitle">Sign up to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="modal-form">
        <div className="formGroup">
          <label htmlFor="modal-register-username">Username</label>
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              id="modal-register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>
        </div>

        <div className="formGroup">
          <label htmlFor="modal-register-email">Email</label>
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              id="modal-register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="formGroup">
          <label htmlFor="modal-register-password">Password</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              id="modal-register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="formGroup">
          <label htmlFor="modal-register-confirm-password">Confirm Password</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              id="modal-register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="formGroup">
          <p> Already have an account? {" "} 
            <span
              onClick={switchToLogin}
              className="login-link"
            >
              Sign in
            </span>
          </p>
        </div>

        <button type="submit" className="modal-submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating account...
            </>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>
    </div>
  );
}

export default RegisterModal;
