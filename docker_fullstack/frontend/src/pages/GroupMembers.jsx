import { useState, useEffect } from "react";
import { useGroup } from "../contexts/GroupContext";
import GroupSidebar from "../components/groups/GroupSidebar";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import { FaEllipsisV } from "react-icons/fa";
import "./Group.css";

function GroupMembers() {
  const {
    group,
    members,
    loading,
    canManageMember,
    canRemoveMember,
    handleUpdateRole,
    handleRemoveMember,
  } = useGroup();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // drowdown handler kun klikataan sen ulkopuolelle
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.group-member-menu')) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleRoleUpdate = async (memberId, newRole) => {
    const success = await handleUpdateRole(memberId, newRole);
    if (success) {
      setOpenMenuId(null);
    }
  };

  const handleMemberRemoveClick = (memberId, memberUsername) => {
    setMemberToRemove({ id: memberId, username: memberUsername });
    setShowRemoveModal(true);
    setOpenMenuId(null);
  };

  const handleConfirmRemove = async () => {
    if (memberToRemove) {
      const success = await handleRemoveMember(memberToRemove.id);
      if (success) {
        setShowRemoveModal(false);
        setMemberToRemove(null);
      }
    }
  };


  if (loading) {
    return (
      <main className="settings-page">
        <div className="settings-content">
          <p>Loading members...</p>
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

  return (
    <div>
      <main className="settings-page">
        <div className="settings-content">
          <GroupSidebar group={group} />
          <div className="settings-form">
            
            <section className="settings-section">
              <header className="settings-section-header">
                <h2 className="settings-section-subtitle">Members ({members.length})</h2>
              </header>
              <div className="settings-field">
                {members.length > 0 && (
                  <div className="group-members-list" style={{ marginTop: '1rem' }}>
                    {members.map((member) => {
                      const canManage = canManageMember(member);
                      const canRemove = canRemoveMember(member);
                      const isOpen = openMenuId === member.id;

                      return (
                        <div key={member.id} className="group-member-item">
                          <div className="group-member-info">
                            <p className="group-member-username">{member.username}</p>
                            <p className="group-member-role">{member.role}</p>
                            {member.joined_at && (
                              <p className="group-member-joined">
                                Member since: {new Date(member.joined_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {(canManage || canRemove) && (
                            <div className="group-member-menu">
                              <button
                                className="group-member-menu-button"
                                onClick={() => setOpenMenuId(isOpen ? null : member.id)}
                              >
                                <FaEllipsisV />
                              </button>
                              {isOpen && (
                                <div className="group-member-dropdown">
                                  {canManage && (
                                    <>
                                      <button
                                        onClick={() => handleRoleUpdate(member.id, 'admin')}
                                        disabled={member.role === 'admin'}
                                      >
                                        Make Admin
                                      </button>
                                      <button
                                        onClick={() => handleRoleUpdate(member.id, 'member')}
                                        disabled={member.role === 'member'}
                                      >
                                        Make Member
                                      </button>
                                      <button
                                        onClick={() => handleRoleUpdate(member.id, 'owner')}
                                        disabled={member.role === 'owner'}
                                      >
                                        Transfer Ownership
                                      </button>
                                    </>
                                  )}
                                  {canRemove && (
                                    <button
                                      className="group-member-remove"
                                      onClick={() => handleMemberRemoveClick(member.id, member.username)}
                                    >
                                      Remove from Group
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </main>
      
      <ConfirmationModal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setMemberToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
        title="Remove Member"
        message={`Are you sure you want to remove "${memberToRemove?.username}" from this group?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="delete"
      />
    </div>
  );
}

export default GroupMembers;

