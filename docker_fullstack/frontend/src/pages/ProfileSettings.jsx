import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Settings.css";
import { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { useNavigate } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";

function ProfileSettings() {
  const { username } = useParams();
  const { user, accessToken, refreshToken, logout } = useAuth();
  const { addToast } = useToast();
  
  const [usernameValue, setUsernameValue] = useState(username || "");
  const [emailValue, setEmailValue] = useState(user?.email || "");
  
  const [isUsernameEditing, setIsUsernameEditing] = useState(false);
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // usernamen tai emailin päivitys laukaisee useEffectit
  useEffect(() => {
    setUsernameValue(username || "");
  }, [username]);

  useEffect(() => {
    if (user?.email) {
      setEmailValue(user.email);
    }
  }, [user?.email]);

  const handleChangeUsername = () => {
    setIsUsernameEditing(true);
  };

  const handleChangeEmail = () => {
    setIsEmailEditing(true);
  };

  const handleCancelUsername = () => {
    setUsernameValue(username || "");
    setIsUsernameEditing(false);
  };

  const handleCancelEmail = () => {
    setEmailValue(user?.email || "");
    setIsEmailEditing(false);
  };

  const handleChangePassword = () => {
    setIsPasswordEditing(true);
  };

  const handleCancelPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsPasswordEditing(false);
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteText("");
    setIsDeleting(false);
  };

  const handleSaveUsername = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/user/${user.id}/username`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken || ""}`
        },
        credentials: "include",
        body: JSON.stringify({ newUsername: usernameValue }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update username");
      }

      addToast("Username updated successfully", "success");
      setIsUsernameEditing(false);
      
      // haetaan todelliset tiedot authcontextista
      await refreshToken();
      
      // navigoi uudelle urlille usernamen perusteella
      navigate(`/${usernameValue}/settings`, { replace: true });
    } catch (error) {
      console.error("Error updating username:", error);
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/user/${user.id}/email`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken || ""}`
        },
        credentials: "include",
        body: JSON.stringify({ newEmail: emailValue }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update email");
      }
      // feedbackia
      addToast("Email updated successfully", "success");
      setIsEmailEditing(false);
      
      // sama juttu, haetaan todelliset tiedot authcontextista
      await refreshToken();
      // redirectiä ei tarvita koska email ei vaikuta.
    } catch (error) {
      console.error("Error updating email:", error);
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!user?.id) return;

    // validointi
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast("All password fields are required", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast("New passwords do not match", "error");
      return;
    }

    if (newPassword.length < 8) {
      addToast("New password must be at least 8 characters long", "error");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      addToast("New password must contain at least one uppercase letter", "error");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      addToast("New password must contain at least one number", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/user/${user.id}/password`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken || ""}`
        },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      addToast("Password updated successfully", "success");
      setIsPasswordEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      addToast(error.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user?.id) return;

    // vahvistus
    if (confirmDeleteText !== `${user.username}/delete`) {
      addToast(`Please type '${user.username}/delete' to confirm account deletion`, "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/user/${user.id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken || ""}`
        },
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete account");
      }

      addToast("Account deleted successfully", "success");
      
      // logout ja etusivulle
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      addToast(error.message || "Failed to delete account", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main className="settings-page">
        <div className="settings-content">
          <ProfileSidebar username={username} />
          <div className="settings-form">
            
            <section className="settings-section">
              <header className="settings-section-header">
                <h2 className="settings-section-title">Change username</h2>
                <p className="settings-section-desc">Your username is used to identify you on the platform</p>
              </header>
              <div className="settings-field">
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={usernameValue} 
                  onChange={(e) => setUsernameValue(e.target.value)} 
                  className="settings-input"
                  disabled={!isUsernameEditing}
                />
                <div className="settings-buttons">
                  {!isUsernameEditing ? (
                    <button 
                      onClick={handleChangeUsername}
                      className="settings-button"
                    >
                      Change username
                    </button>
                  ) : (
                    <div className="settings-actions">
                      <button 
                        onClick={handleSaveUsername}
                        className="settings-button settings-button-save"
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelUsername}
                        className="settings-button settings-button-cancel"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {loading && isUsernameEditing && (
                    <div className="settings-loading">Saving changes...</div>
                  )}
                </div>
              </div>
            </section>

            <section className="settings-section">
              <header className="settings-section-header">
                <h2 className="settings-section-title">Change email</h2>
                <p className="settings-section-desc">Your email address is used for account recovery and notifications</p>
              </header>
              <div className="settings-field">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={emailValue} 
                  onChange={(e) => setEmailValue(e.target.value)} 
                  className="settings-input"
                  disabled={!isEmailEditing}
                />
                <div className="settings-buttons">
                  {!isEmailEditing ? (
                    <button 
                      onClick={handleChangeEmail}
                      className="settings-button"
                    >
                      Change email
                    </button>
                  ) : (
                    <div className="settings-actions">
                      <button 
                        onClick={handleSaveEmail}
                        className="settings-button settings-button-save"
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEmail}
                        className="settings-button settings-button-cancel"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {loading && isEmailEditing && (
                    <div className="settings-loading">Saving changes...</div>
                  )}
                </div>
              </div>
            </section>

            <section className="settings-section">
              <header className="settings-section-header">
                <h2 className="settings-section-title">Change password</h2>
                <p className="settings-section-desc">Update your password to keep your account secure</p>
              </header>
              {!isPasswordEditing ? (
                <div className="settings-field">
                  <input 
                    type="password" 
                    value="asdasdsad" 
                    className="settings-input"
                    disabled={true}
                    readOnly
                  />
                  <div className="settings-buttons">
                    <button 
                      onClick={handleChangePassword}
                      className="settings-button"
                    >
                      Change password
                    </button>
                  </div>
                </div>
              ) : (
                <div className="settings-field">
                  <input 
                    type="password" 
                    placeholder="Current password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    className="settings-input"
                  />
                  <input 
                    type="password" 
                    placeholder="New password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="settings-input"
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="settings-input"
                  />
                  <div className="settings-buttons">
                    <div className="settings-actions">
                      <button 
                        onClick={handleSavePassword}
                        className="settings-button settings-button-save"
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelPassword}
                        className="settings-button settings-button-cancel"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                    {loading && (
                      <div className="settings-loading">Saving changes...</div>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="settings-section">
              <header className="settings-section-header">
                <h2 className="settings-section-title"
                style={{ color: "#d32f2f" }}
                >Delete account</h2>
                <p className="settings-section-desc">After deleting your account, there is no way to recover it. Be careful.</p>
              </header>
              {!isDeleting ? (
                <div className="settings-field">
                  <button 
                    onClick={handleDeleteAccount}
                    className="settings-button-delete"
                  >
                    Delete account
                  </button>
                </div>
              ) : (
                <div className="settings-field">
                  <input 
                    type="text" 
                    placeholder={`Type "${user.username}/delete" to confirm`} 
                    value={confirmDeleteText} 
                    onChange={(e) => setConfirmDeleteText(e.target.value)} 
                    className="settings-input"
                  />
                  <div className="settings-buttons">
                    <div className="settings-actions">
                      <button 
                        onClick={handleConfirmDelete}
                        className="settings-button settings-button-save"
                        disabled={loading || confirmDeleteText !== `${user.username}/delete`}
                        style={{ 
                          background: confirmDeleteText === `${user.username}/delete` ? "#d32f2f" : "#1a1a1a",
                          opacity: confirmDeleteText === `${user.username}/delete` ? 1 : 0.5
                        }}
                      >
                        Confirm deletion
                      </button>
                      <button 
                        onClick={handleCancelDelete}
                        className="settings-button settings-button-cancel"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                    {loading && (
                      <div className="settings-loading">Deleting account...</div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfileSettings;

