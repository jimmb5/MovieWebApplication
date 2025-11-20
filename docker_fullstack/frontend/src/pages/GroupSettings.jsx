import { useState, useEffect } from "react";
import { useGroup } from "../contexts/GroupContext";
import { useToast } from "../contexts/ToastContext";
import GroupSidebar from "../components/groups/GroupSidebar";
import "./Settings.css";

function GroupSettings() {
  const {
    group,
    loading,
    canEdit,
    isOwner,
    handleUpdateGroup,
    handleDeleteGroup,
  } = useGroup();
  const { addToast } = useToast();
  
  const [nameValue, setNameValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (group) {
      setNameValue(group.name);
      setDescriptionValue(group.description);
    }
  }, [group]);

  const handleChangeName = () => {
    setIsNameEditing(true);
  };

  const handleChangeDescription = () => {
    setIsDescriptionEditing(true);
  };

  const handleCancelName = () => {
    setNameValue(group?.name);
    setIsNameEditing(false);
  };

  const handleCancelDescription = () => {
    setDescriptionValue(group?.description);
    setIsDescriptionEditing(false);
  };

  const handleStartDelete = () => {
    setIsDeleting(true);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteText("");
    setIsDeleting(false);
  };

  const handleSaveName = async () => {
    setSaving(true);
    const success = await handleUpdateGroup(nameValue, group?.description);
    if (success) {
      setIsNameEditing(false);
    }
    setSaving(false);
  };

  const handleSaveDescription = async () => {
    setSaving(true);
    const success = await handleUpdateGroup(group?.name, descriptionValue);
    if (success) {
      setIsDescriptionEditing(false);
    }
    setSaving(false);
  };

  const handleConfirmDelete = async () => {
    // Vahvistus
    if (confirmDeleteText !== `${group?.name}/delete`) {
      addToast(`Please type '${group?.name}/delete' to confirm group deletion`, "error");
      return;
    }

    setSaving(true);
    await handleDeleteGroup();
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="settings-page">
        <div className="settings-content">
          <p>Loading group settings...</p>
        </div>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="settings-page">
        <div className="settings-content">
          <p>Group not found</p>
        </div>
      </main>
    );
  }

  const canEditGroup = canEdit();
  const userIsOwner = isOwner();

  return (
    <div>
      <main className="settings-page">
        <div className="settings-content">
          <GroupSidebar group={group} />
          <div className="settings-form">
            
            {canEditGroup && (
              <>
                <section className="settings-section">
                  <header className="settings-section-header">
                    <h2 className="settings-section-title">Change group name</h2>
                    <p className="settings-section-desc">Update the name of your group</p>
                  </header>
                  <div className="settings-field">
                    <input 
                      type="text" 
                      placeholder="Group name" 
                      value={nameValue} 
                      onChange={(e) => setNameValue(e.target.value)} 
                      className="settings-input"
                      disabled={!isNameEditing}
                    />
                    <div className="settings-buttons">
                      {!isNameEditing ? (
                        <button 
                          onClick={handleChangeName}
                          className="settings-button"
                        >
                          Change name
                        </button>
                      ) : (
                        <div className="settings-actions">
                          <button 
                            onClick={handleSaveName}
                            className="settings-button settings-button-save"
                            disabled={saving}
                          >
                            Save
                          </button>
                          <button 
                            onClick={handleCancelName}
                            className="settings-button settings-button-cancel"
                            disabled={saving}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {saving && isNameEditing && (
                        <div className="settings-loading">Saving changes...</div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="settings-section">
                  <header className="settings-section-header">
                    <h2 className="settings-section-title">Change description</h2>
                    <p className="settings-section-desc">Update the description of your group</p>
                  </header>
                  <div className="settings-field">
                    <textarea
                      placeholder="Group description" 
                      value={descriptionValue} 
                      onChange={(e) => setDescriptionValue(e.target.value)} 
                      className="form-textarea"
                      disabled={!isDescriptionEditing}
                      rows={4}
                    />
                    <div className="settings-buttons">
                      {!isDescriptionEditing ? (
                        <button 
                          onClick={handleChangeDescription}
                          className="settings-button"
                        >
                          Change description
                        </button>
                      ) : (
                        <div className="settings-actions">
                          <button 
                            onClick={handleSaveDescription}
                            className="settings-button settings-button-save"
                            disabled={saving}
                          >
                            Save
                          </button>
                          <button 
                            onClick={handleCancelDescription}
                            className="settings-button settings-button-cancel"
                            disabled={saving}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {saving && isDescriptionEditing && (
                        <div className="settings-loading">Saving changes...</div>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}

            {!canEditGroup && (
              <section className="settings-section">
                <header className="settings-section-header">
                  <h2 className="settings-section-title">No permissions</h2>
                  <p className="settings-section-desc">You need to be an owner or admin to edit group settings</p>
                </header>
              </section>
            )}

            {userIsOwner && (
              <section className="settings-section">
                <header className="settings-section-header">
                  <h2 className="settings-section-title"
                  style={{ color: "#d32f2f" }}
                  >Delete group</h2>
                  <p className="settings-section-desc">After deleting the group, there is no way to recover it. Be careful.</p>
                </header>
                {!isDeleting ? (
                  <div className="settings-field">
                    <button 
                      onClick={handleStartDelete}
                      className="settings-button-delete"
                    >
                      Delete group
                    </button>
                  </div>
                ) : (
                  <div className="settings-field">
                    <input 
                      type="text" 
                      placeholder={`Type "${group.name}/delete" to confirm`} 
                      value={confirmDeleteText} 
                      onChange={(e) => setConfirmDeleteText(e.target.value)} 
                      className="settings-input"
                    />
                    <div className="settings-buttons">
                      <div className="settings-actions">
                        <button 
                          onClick={handleConfirmDelete}
                          className="settings-button settings-button-save"
                          disabled={saving || confirmDeleteText !== `${group.name}/delete`}
                          style={{ 
                            background: confirmDeleteText === `${group.name}/delete` ? "#d32f2f" : "#1a1a1a",
                            opacity: confirmDeleteText === `${group.name}/delete` ? 1 : 0.5
                          }}
                        >
                          Confirm deletion
                        </button>
                        <button 
                          onClick={handleCancelDelete}
                          className="settings-button settings-button-cancel"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </div>
                      {saving && (
                        <div className="settings-loading">Deleting group...</div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default GroupSettings;

