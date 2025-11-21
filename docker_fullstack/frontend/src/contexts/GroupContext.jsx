import { createContext, useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const { groupId } = useParams();
  const { user, accessToken } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(true);

  useEffect(() => {
    if (groupId && accessToken) {
      fetchGroup();
      fetchMembers();
      fetchPosts();
    }
  }, [groupId, accessToken]);

  const fetchGroup = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setIsMember(true);
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
        if (res.status === 403) {
          setIsMember(false);
          addToast("You must be a member of this group to view it", "error");
          setTimeout(() => {
            navigate("/groups");
          }, 2000);
          return;
        }
        throw new Error(error.error);
      }

      const data = await res.json();
      setGroup(data);
    } catch (error) {
      console.error("Error fetching group:", error);
      addToast("Failed to load group", "error");
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

  const fetchJoinRequests = async () => {
    if (!accessToken || !groupId) {
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/join-requests`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch join requests");
      }

      const data = await res.json();
      setJoinRequests(data);
    } catch (error) {
      console.error("Error fetching join requests:", error);
    }
  };

  const fetchPosts = async () => {
    if (!accessToken || !groupId) {
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/posts`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      addToast("Failed to load posts", "error");
    }
  };

  const createPost = async (description, movieTmdbId) => {
    if (!accessToken || !groupId) return false;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/create-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include",
        body: JSON.stringify({
          description: description || null,
          movie_tmdb_id: movieTmdbId || null
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error); 
      }

      addToast("Post created successfully", "success");
      fetchPosts(); // päivitetään postaukset
      return true;
    } catch (error) {
      console.error("Error creating post:", error);
      addToast("Failed to create post", "error");
      return false;
    }
  };

  // käyttäjän rooli ryhmässä
  const getCurrentUserRole = () => {
    if (!user || !members.length) return null;
    const currentMember = members.find(m => m.id === user.id);
    return currentMember ? currentMember.role : null;
  };

  // onko oikeudet hallinoida jäsenten rooleja (vain owner, voidaan päivittää myöhemmin helposti hyväksymään vaikka admin myös)
  const canManageMember = (member) => {
    const currentRole = getCurrentUserRole();
    if (!currentRole) return false;
    if (member.id === user.id) return false;
    return currentRole === 'owner';
  };

  // onko oikeudet poistaa jäsenen
  const canRemoveMember = (member) => {
    const currentRole = getCurrentUserRole();
    if (!currentRole) return false;
    if (member.id === user.id) return false;
    
    if (currentRole === 'owner') {
      return true;
    }
    if (currentRole === 'admin') {
      return member.role === 'member';
    }
    return false;
  };

  // onko oikeudet hallinoida join requesteja
  const canManageRequests = () => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'admin';
  };

  // tarkistusfunktio onko oikeudet muokata ryhmän asetuksia
  const canEdit = () => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'admin';
  };

  // onko käyttäjä owner
  const isOwner = () => {
    return getCurrentUserRole() === 'owner';
  };

  // jäsenen roolin päivitys 
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
        throw new Error(error.error);
      }

      addToast("Role updated successfully", "success");
      fetchMembers();
      return true;
    } catch (error) {
      console.error("Error updating role:", error);
      addToast("Failed to update role", "error");
      return false;
    }
  };

  // Poista jäsen ryhmästä
  const handleRemoveMember = async (memberId) => {
    if (!accessToken || !groupId) return false;

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
        throw new Error(error.error || "Failed to remove member");
      }

      addToast("Member removed successfully", "success");
      fetchMembers();
      fetchGroup(); // Päivitetään ryhmän tiedot 
      return true;
    } catch (error) {
      console.error("Error removing member:", error);
      addToast("Failed to remove member", "error");
      return false;
    }
  };

  // Hyväksy join request
  const handleApproveRequest = async (requestId) => {
    if (!accessToken || !groupId) return false;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/join-requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to approve request");
      }

      addToast("Join request approved", "success");
      fetchJoinRequests();
      fetchMembers();
      fetchGroup(); // Päivitetään ryhmän tiedot 
      return true;
    } catch (error) {
      console.error("Error approving request:", error);
      addToast("Failed to approve request", "error");
      return false;
    }
  };

  // Hylkää join request
  const handleRejectRequest = async (requestId) => {
    if (!accessToken || !groupId) return false;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/join-requests/${requestId}/reject`, {
        method: "POST",
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

      addToast("Join request rejected", "success");
      fetchJoinRequests();
      return true;
    } catch (error) {
      console.error("Error rejecting request:", error);
      addToast("Failed to reject request", "error");
      return false;
    }
  };

  // Päivitä ryhmän tiedot tällä hetkellä nimi + kuvaus
  const handleUpdateGroup = async (name, description) => {
    if (!accessToken || !groupId) return false;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        credentials: "include",
        body: JSON.stringify({
          name: name !== undefined ? name : group?.name,
          description: description !== undefined ? description : group?.description
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      addToast("Group updated successfully", "success");
      fetchGroup(); // päivitetään ryhmän tiedot
      return true;
    } catch (error) {
      console.error("Error updating group:", error);
      addToast("Failed to update group", "error");
      return false;
    }
  };

  // Poista ryhmä
  const handleDeleteGroup = async () => {
    if (!accessToken || !groupId) return false;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}`, {
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

      addToast("Group deleted successfully", "success");
      navigate("/groups");
      return true;
    } catch (error) {
      console.error("Error deleting group:", error);
      addToast("Failed to delete group", "error");
      return false;
    }
  };

  const leaveGroup = async () => {
    if (!accessToken || !groupId) return false;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/leave`, {
        method: "POST",
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

      addToast("You have successfully left the group", "success");
      navigate("/groups");
      return true;
    } catch (error) {
      if(isOwner()) {
        addToast("Group owner cannot leave the group. Transfer ownership first or delete the group.", "error");
        return false;
      } else {
        console.error("Error leaving group:", error);
        addToast("Failed to leave group", "error");
        return false;
      }
    }
  };

  const value = {
    group,
    members,
    joinRequests,
    posts,
    loading,
    isMember,
    fetchGroup,
    fetchMembers,
    fetchJoinRequests,
    fetchPosts,
    createPost,
    getCurrentUserRole,
    canManageMember,
    canRemoveMember,
    canManageRequests,
    canEdit,
    isOwner,
    handleUpdateRole,
    handleRemoveMember,
    handleApproveRequest,
    handleRejectRequest,
    handleUpdateGroup,
    handleDeleteGroup,
    leaveGroup,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroup() {
  return useContext(GroupContext);
}

