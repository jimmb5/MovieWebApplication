import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import GroupSidebar from "../components/GroupSidebar";
import { FaEllipsisV } from "react-icons/fa";
import "./Group.css";

function Group() {
  const { groupId } = useParams();
  const { user, accessToken } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

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

  useEffect(() => {
    if (groupId && accessToken) {
      fetchGroup();
      fetchMembers();
    }
  }, [groupId, accessToken]);

  const fetchGroup = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setIsMember(true); // asetetaan että käyttäjä on jäsen
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        // jos backend palauttaa 403 eli ei ole jäsen, asetetaan ismember falseksi ja ohjataan takaisin public groups sivulle
        // tänne asti ei pitäisi edes päätyä koska linkit on myös estetty
        if (res.status === 403) {
          setIsMember(false);
          addToast("You must be a member of this group to view it", "error");
          setTimeout(() => {
            navigate("/groups");
          }, 2000);
          return;
        }
        throw new Error(error.error || "Failed to fetch group");
      }

      const data = await res.json();
      setGroup(data);
    } catch (error) {
      console.error("Error fetching group:", error);
      addToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!accessToken || !groupId) {
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/members`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
      addToast("Failed to load members", "error");
    }
  };

  // haetaan käyttäjän rooli 
  const getCurrentUserRole = () => {
    if (!user || !members.length) return null;
    const currentMember = members.find(m => m.id === user.id);
    return currentMember ? currentMember.role : null;
  };

  const canManageMember = (member) => {
    const currentRole = getCurrentUserRole();
    if (!currentRole) return false;
    // itselle ei voi tehdä mitään
    if (member.id === user.id) return false;
    
    // vain owner voi muuttaa rooleja
    return currentRole === 'owner';
  };

  const canRemoveMember = (member) => {
    const currentRole = getCurrentUserRole();
    if (!currentRole) return false;
    if (member.id === user.id) return false; // ei voi poistaa itseään, voi poistua kylläkin
    
    if (currentRole === 'owner') {
      return true; // owner voi poistaa kenet tahansa (paitsi itsensä)
    }
    if (currentRole === 'admin') {
      return member.role === 'member'; // admin voi poistaa vain membereitä ( ei owner tai adminia)
    }
    return false;
  };

  // Päivitä jäsenen rooli
  const handleUpdateRole = async (memberId, newRole) => {
    if (!accessToken || !groupId) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/members/${memberId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include",
        body: JSON.stringify({ newRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update role");
      }

      addToast("Role updated successfully", "success");
      setOpenMenuId(null);
      fetchMembers(); // päivitetään lista
    } catch (error) {
      console.error("Error updating role:", error);
      addToast(error.message, "error");
    }
  };

  // Poista jäsen ryhmästä
  const handleRemoveMember = async (memberId) => {
    if (!accessToken || !groupId) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      addToast("Member removed successfully", "success");
      setOpenMenuId(null);
      fetchMembers(); // päivitetään lista
    } catch (error) {
      console.error("Error removing member:", error);
      addToast("Failed to remove member", "error");
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
          {group.description && <p>{group.description}</p>}
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
                                  onClick={() => handleUpdateRole(member.id, 'admin')}
                                  disabled={member.role === 'admin'}
                                >
                                  Make Admin
                                </button>
                                <button
                                  onClick={() => handleUpdateRole(member.id, 'member')}
                                  disabled={member.role === 'member'}
                                >
                                  Make Member
                                </button>
                                <button
                                  onClick={() => handleUpdateRole(member.id, 'owner')}
                                  disabled={member.role === 'owner'}
                                >
                                  Transfer Ownership
                                </button>
                              </>
                            )}
                            {canRemove && (
                              <button
                                className="group-member-remove"
                                onClick={() => handleRemoveMember(member.id)}
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
    </main>
  );
}

export default Group;
