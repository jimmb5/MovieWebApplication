import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import "./PublicGroups.css";

function PublicGroups() {
  const { user, accessToken } = useAuth();
  const { addToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [userJoinRequests, setUserJoinRequests] = useState([]);
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    fetchGroups();
    if (user && accessToken) {
      fetchUserJoinRequests();
      fetchUserGroups();
    }
  }, [user, accessToken]);

  const fetchUserJoinRequests = async () => {
    if (!user || !accessToken) {
      setUserJoinRequests([]);
      return;
    }
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/user/join-requests`, {
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch user join requests");
      }

      const data = await res.json();
      setUserJoinRequests(data);
    } catch (error) {
      console.error("Error fetching user join requests:", error);
      addToast(error.message, "error");
    }
  };

  const fetchUserGroups = async () => {
    if (!user || !accessToken) {
      setUserGroups([]);
      return;
    }
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/user/${user.id}`, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch user groups");
      }

      const data = await res.json();
      setUserGroups(data);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      addToast(error.message, "error");
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch groups");
      }

      const data = await res.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      addToast("Failed to load groups", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (groupId) => {
    if (!user || !accessToken) {
      addToast("Please log in to join a group", "error");
      return;
    }

    setJoiningGroupId(groupId);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/join-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send join request");
      }

      addToast("Join request sent successfully", "success");
      // Päivitä userJoinRequests lista
      await fetchUserJoinRequests();
    } catch (error) {
      console.error("Error sending join request:", error);
      addToast(error.message, "error");
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleGroupClick = (e, groupId) => {
    if (!user) {
      e.preventDefault();
      addToast("Please log in to view group details", "error");
      return;
    }
    
  const isMember = userGroups.some(userGroup => userGroup.id === groupId);
  
    if (!isMember) {
      e.preventDefault();
      addToast("You must be a member of this group to view it", "error");
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description &&
      group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <main className="public-groups-page">
        <div className="public-groups-content">
          <p className="public-groups-loading">Loading groups...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="public-groups-page">
      <div className="public-groups-content">
        <div className="public-groups-header">
          <h1>Public Groups</h1>
          <p>Browse and join public groups</p>
        </div>

        <div className="public-groups-controls">
          <input
            type="text"
            placeholder="Search groups..."
            className="public-groups-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredGroups.length === 0 ? (
          <p className="public-groups-empty">
            {searchTerm
              ? "No groups found matching your search"
              : "No groups available"}
          </p>
        ) : (
          <ul className="public-groups-list">
            {filteredGroups.map((group) => (
              <li key={group.id} className="public-group-item">
                <div className="public-group-item-content">
                  <h2>
                    {user && userGroups.some(userGroup => userGroup.id === group.id) ? (
                      <Link to={`/groups/${group.id}`} className="public-group-link">
                        {group.name}
                      </Link>
                    ) : (
                      <span 
                        className="public-group-link" 
                        style={{ cursor: "not-allowed", opacity: 0.6 }}
                        onClick={(e) => handleGroupClick(e, group.id)}
                      >
                        {group.name}
                      </span>
                    )}
                  </h2>
                  {group.description && <p>{group.description}</p>}
                </div>
                <div className="public-group-item-actions">
                  {user ? (
                    userGroups.some(userGroup => userGroup.id === group.id) ? (
                      <p className="public-group-member-text">Already a member</p>
                    ) : userJoinRequests.some(request => request.group_id === group.id) ? (
                      <p className="public-group-pending-text">Join request pending</p>
                    ) : (
                      <button
                        onClick={() => handleJoinRequest(group.id)}
                        disabled={joiningGroupId === group.id}
                        className="public-group-join-button"
                      >
                        {joiningGroupId === group.id ? "Requesting join..." : "Request join"}
                      </button>
                    )
                  ) : (
                    <p className="public-group-login-text">Login to join group</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default PublicGroups;

