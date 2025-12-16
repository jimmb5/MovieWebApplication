import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import "./Profile.css";

function Profile() {
  const { username } = useParams();
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState({
    reviewCount: 0,
    groupCount: 0,
    favoriteCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch reviews
        try {
          const reviewsRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/review/user/${username}`,
            { withCredentials: true }
          );
          setStats(prev => ({ ...prev, reviewCount: reviewsRes.data.length }));
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }

        // Fetch groups if user is authenticated
        if (user && accessToken) {
          try {
            const groupsRes = await axios.get(
              `${process.env.REACT_APP_API_URL}/groups/user/${user.id}`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true
              }
            );
            setStats(prev => ({ ...prev, groupCount: groupsRes.data.length }));
          } catch (error) {
            console.error("Error fetching groups:", error);
          }

          // Fetch favorites
          try {
            const favoritesRes = await axios.get(
              `${process.env.REACT_APP_API_URL}/favorites/user/${username}`,
              { withCredentials: true }
            );
            const favoritesArray = favoritesRes.data.favorites || [];
            setStats(prev => ({ ...prev, favoriteCount: favoritesArray.length }));
          } catch (error) {
            console.error("Error fetching favorites:", error);
          }
        }
        
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, user, accessToken]);

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-content">
          <div className="profile-sidebar-column">
            <ProfileSidebar username={username} />
          </div>
          <div className="profile-main-content">
            <p className="profile-loading">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-content">
        <div className="profile-sidebar-column">
          <ProfileSidebar username={username} />
        </div>
        
        <div className="profile-main-content">
          <div className="profile-header">
            <h1>{username}</h1>
            {user && user.email && (
              <p>{user.email}</p>
            )}
          </div>

          <div className="profile-stats">
            <h2>Statistics</h2>
            <div className="profile-stats-list">
              <div className="profile-stat-item">
                <span className="profile-stat-label">Reviews:</span>
                <span className="profile-stat-value">{stats.reviewCount}</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">Groups:</span>
                <span className="profile-stat-value">{stats.groupCount}</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">Favorites:</span>
                <span className="profile-stat-value">{stats.favoriteCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;

