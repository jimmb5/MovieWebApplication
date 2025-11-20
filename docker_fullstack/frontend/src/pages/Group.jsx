import { useState, useEffect } from "react";
import { useGroup } from "../contexts/GroupContext";
import GroupSidebar from "../components/groups/GroupSidebar";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import GroupPostCreator from "../components/groups/GroupPostCreator";
import GroupPost from "../components/groups/GroupPost";
import DropdownMenu from "../components/modals/DropdownMenu";
import "./Group.css";

function Group() {
  const {
    group,
    members,
    posts,
    loading,
    isMember,
    canManageMember,
    canRemoveMember,
    handleUpdateRole,
    handleRemoveMember,
  } = useGroup();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);


  const handleRoleUpdate = async (memberId, newRole) => {
    await handleUpdateRole(memberId, newRole);
  };

  const handleMemberRemoveClick = (memberId, memberUsername) => {
    setMemberToRemove({ id: memberId, username: memberUsername });
    setShowRemoveModal(true);
  };

  const getMemberMenuItems = (member) => {
    const menuItems = [];
    
    if (canManageMember(member)) {
      menuItems.push(
        {
          id: 'make-admin',
          label: 'Make Admin',
          onClick: () => handleRoleUpdate(member.id, 'admin'),
          disabled: member.role === 'admin'
        },
        {
          id: 'make-member',
          label: 'Make Member',
          onClick: () => handleRoleUpdate(member.id, 'member'),
          disabled: member.role === 'member'
        },
        {
          id: 'transfer-ownership',
          label: 'Transfer Ownership',
          onClick: () => handleRoleUpdate(member.id, 'owner'),
          disabled: member.role === 'owner'
        }
      );
    }
    
    if (canRemoveMember(member)) {
      menuItems.push({
        id: 'remove',
        label: 'Remove from Group',
        onClick: () => handleMemberRemoveClick(member.id, member.username),
        danger: true
      });
    }

    return menuItems;
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
        <div className="group-content">
          <div className="group-sidebar-column" />
          <div className="group-content-main">
            <p className="group-loading">Loading group...</p>
          </div>
          <div className="group-right-column" />
        </div>
      </main>
    );
  }

  if (!isMember) {
    return (
      <main className="group-page">
        <div className="group-content">
          <div className="group-sidebar-column" />
          <div className="group-content-main">
            <p className="group-error">You must be a member of this group to view it</p>
            <p>Redirecting to public groups...</p>
          </div>
          <div className="group-right-column" />
        </div>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="group-page">
        <div className="group-content">
          <div className="group-sidebar-column" />
          <div className="group-content-main">
            <p className="group-error">Group not found</p>
          </div>
          <div className="group-right-column" />
        </div>
      </main>
    );
  }

  return (
    <main className="group-page">
      <div className="group-content">
        <div className="group-sidebar-column">
          <GroupSidebar group={group} />
        </div>
        <div className="group-content-main">
          <div className="group-header">
            <h1>{group.name}</h1>
          </div>
          <div className="group-body">
            <GroupPostCreator />
            <div className="group-posts-list">
              {posts.map((post) => (
                <GroupPost key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
        <div className="group-right-column">
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
                  const menuItems = getMemberMenuItems(member);

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
                          <DropdownMenu items={menuItems} />
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
