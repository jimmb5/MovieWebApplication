import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import ProfileSidebar from "../components/ProfileSidebar";
import CreateGroup from "../components/CreateGroup";
import "./OwnGroups.css";

function Groups() {
  const { username } = useParams();
  const { user, accessToken } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userJoinRequests, setUserJoinRequests] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [cancellingRequestId, setCancellingRequestId] = useState(null);

  useEffect(() => {
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
      // ei näytetä virhettä kirjautumattomille 
      if (user) {
        addToast(error.message, "error");
      }
    }
  };

  const fetchUserGroups = async () => {
    setLoading(true);
    if (!user || !accessToken) {
      setUserGroups([]);
      setLoading(false);
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
      if (user) {
        addToast(error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJoinRequest = async (groupId, requestId) => {
    if (!user || !accessToken) {
      return;
    }

    setCancellingRequestId(requestId);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/join-requests/${requestId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to cancel join request");
      }

      addToast("Join request cancelled", "success");
      await fetchUserJoinRequests();
    } catch (error) {
      console.error("Error cancelling join request:", error);
      addToast(error.message, "error");
    } finally {
      setCancellingRequestId(null);
    }
  };

  const filteredGroups = userGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description &&
      group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <main className="groups-page">
        <div className="groups-content">
          <ProfileSidebar username={username} />
          <div className="groups-content-main">
            <p className="groups-loading">Loading groups...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="groups-page">
      <div className="groups-content">
        <div className="groups-sidebar-column">
          <ProfileSidebar username={username} />
          {userJoinRequests.length > 0 && (
            <div className="groups-join-requests">
              <h2>My Pending Join Requests</h2>
              <div className="groups-divider"></div>
              <ul className="groups-join-requests-list">
                {userJoinRequests.map((request) => (
                  <li key={request.id} className="group-join-request-item">
                    <div className="group-join-request-content">
                      <h3>
                        <Link to={`/groups/${request.group_id}`} className="group-join-request-link">
                          {request.group_name}
                        </Link>
                      </h3>
                      {request.group_description && <p>{request.group_description.slice(0, 25)}...</p>}
                    </div>
                    <div className="group-join-request-actions">
                      <p className="group-pending-text">Request pending</p>
                      <button
                        className="group-cancel-button"
                        onClick={() => handleCancelJoinRequest(request.group_id, request.id)}
                        disabled={cancellingRequestId === request.id}
                      >
                        {cancellingRequestId === request.id ? "Cancelling..." : "Cancel"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="groups-divider"></div>
            </div>
          )}
        </div>
        <div className="groups-content-main">
          <div className="groups-header">
            <h1>My Groups</h1>
            <p>List of your groups you are a member of</p>
          </div>
          <div className="groups-controls">
            <input 
              type="text" 
              placeholder="Search groups..." 
              className="groups-search-input" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button 
              className="groups-create-button"
              onClick={() => setIsCreateGroupOpen(true)}
            >
              Create Group
            </button>
          </div>
          {filteredGroups.length === 0 ? (
            <p className="groups-empty">
              {searchTerm
                ? "No groups found matching your search"
                : "You are not a member of any groups yet"}
            </p>
          ) : (
            <ul className="groups-list">
              {filteredGroups.map((group) => (
                <li key={group.id} className="group-item">
                  <div className="group-item-content">
                    <div className="group-item-header">
                      <h2>
                        <Link to={`/groups/${group.id}`} className="group-link">
                          {group.name}
                        </Link>
                      </h2>
                      {group.role && (
                        <span className={`group-role-badge group-role-${group.role}`}>
                          {group.role}
                        </span>
                      )}
                    </div>
                    {group.description && <p>{group.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <CreateGroup
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={() => {
          fetchUserGroups();
        }}
      />
    </main>
  );
}

export default Groups;

