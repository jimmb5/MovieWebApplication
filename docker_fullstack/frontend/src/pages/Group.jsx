import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import "./Group.css";

function Group() {
  const { groupId } = useParams();
  const { user, accessToken } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(true);

  useEffect(() => {
    if (groupId && accessToken) {
      fetchGroup();
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

  if (loading) {
    return (
      <main className="group-page">
        <div className="group-content">
          <p className="group-loading">Loading group...</p>
        </div>
      </main>
    );
  }

  if (!isMember) {
    return (
      <main className="group-page">
        <div className="group-content">
          <p className="group-error">You must be a member of this group to view it</p>
          <p>Redirecting to public groups...</p>
        </div>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="group-page">
        <div className="group-content">
          <p className="group-error">Group not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="group-page">
      <div className="group-content">
        <div className="group-header">
          <h1>{group.name}</h1>
          {group.description && <p>{group.description}</p>}
        </div>
        <div className="group-body">
          <div className="group-info">
            <h2>Group Information</h2>
            {group.creator_username && (
              <p>Created by: {group.creator_username}</p>
            )}
            {group.member_count !== undefined && (
              <p>Members: {group.member_count}</p>
            )}
            {group.created_at && (
              <p>Created: {new Date(group.created_at).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Group;
