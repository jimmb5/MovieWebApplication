import { useState, useEffect } from "react";
import { useGroup } from "../contexts/GroupContext";
import GroupSidebar from "../components/GroupSidebar";
import ConfirmationModal from "../components/ConfirmationModal";
import { FaEllipsisV } from "react-icons/fa";
import "./Group.css";

function Group() {
  const {
    group,
    members,
    loading,
    isMember,
    canManageMember,
    canRemoveMember,
    handleUpdateRole,
    handleRemoveMember,
  } = useGroup();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Dropdownin sulkemiseen kun klikataan sen ulkopuolelle
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
      <main className="group-page">
        <div className="group-center-content">
          <p className="group-loading">Loading group...</p>
        </div>
      </main>
    );
  }

  if (!isMember) {
    return (
      <main className="group-page">
        <div className="group-center-content">
          <p className="group-error">You must be a member of this group to view it</p>
          <p>Redirecting to public groups...</p>
        </div>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="group-page">
        <div className="group-center-content">
          <p className="group-error">Group not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="group-page">
      <div className="group-left-content">
        <GroupSidebar group={group} />
      </div>
      <div className="group-center-content">
        <div className="group-header">
          <h1>{group.name}</h1>
          <p>Content here</p>
        </div>
        <div className="group-body">
        </div>
      </div>
      <div className="group-right-content">
        <div className="group-info">
          <h2>About {group.name}</h2>
          {group.description && <p>{group.description}</p>}
          {group.creator_username && (
            <p>Created by: {group.creator_username}</p>
          )}
          {group.member_count !== undefined && (
            <p>Members: {group.member_count}</p>
          )}
          {group.created_at && (
            <p>Created: {new Date(group.created_at).toLocaleDateString()}</p>
          )}
          {group.owner_username && (
            <p>Owner: {group.owner_username}</p>
          )}
        </div>
        <div className="group-members">
          <h2>Members ({members.length})</h2>
          {members.length > 0 ? (
            <div className="group-members-list">
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
          ) : (
            <p>No members found</p>
          )}
        </div>
      </div>
      
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
    </main>
  );
}

export default Group;
