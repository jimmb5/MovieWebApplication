import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { FaUsers, FaTimes } from "react-icons/fa";
import "./Modal.css";

function CreateGroup({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const mouseDownTarget = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create group");
      }

      const data = await res.json();
      addToast("Group created successfully", "success");
      handleClose();
      if (onGroupCreated) {
        onGroupCreated();
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={(e) => {
        mouseDownTarget.current = e.target;
      }}
      onMouseUp={(e) => {
        if (mouseDownTarget.current === e.target && e.target.classList.contains('modal-overlay')) {
          handleClose();
        }
        mouseDownTarget.current = null;
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="modal-header">
          <div className="modal-icon">
            <FaUsers size={32} />
          </div>
          <h2>Create New Group</h2>
          <p className="modal-subtitle">Start a new group to share movies with others</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="formGroup">
            <label htmlFor="group-name">Group Name</label>
            <div className="input-wrapper">
              <input
                id="group-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
                className="no-icon"
              />
            </div>
          </div>

          <div className="formGroup">
            <label htmlFor="group-description">Description (Optional)</label>
            <textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              rows={4}
              className="form-textarea"
            />
          </div>

          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              "Create Group"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateGroup;

