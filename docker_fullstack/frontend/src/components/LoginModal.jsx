import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { FaUser, FaLock, FaTimes } from "react-icons/fa";
import "./Modal.css";

function LoginModal({ isOpen, onClose, switchToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      addToast("Login successful", "success");
      onClose();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
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
        <h2>Welcome Back</h2>
        <p className="modal-subtitle">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="modal-form">
        <div className="formGroup">
          <label htmlFor="modal-username">Username</label>
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              id="modal-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
        </div>

        <div className="formGroup">
          <label htmlFor="modal-password">Password</label>
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              id="modal-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        <div className="formGroup">
          <p> Don't have an account? {" "} 
            <span
              onClick={switchToRegister}
              className="register-link"
            >
              Sign up
            </span>
          </p>
        </div>

        <button type="submit" className="modal-submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}

export default LoginModal;