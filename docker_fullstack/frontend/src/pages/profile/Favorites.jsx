import { useAuth } from "../../contexts/AuthContext";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Favorites.css";

function Favorites() {
  const { user, accessToken } = useAuth();
  const token = accessToken || localStorage.getItem("token");

  const { username } = useParams(); // detect if viewing someone else's page
  const isPublicView = !!username; // true if viewing another user's favorites
  const isOwnProfile = !isPublicView || (user && user.username === username);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const TMDB_KEY = process.env.REACT_APP_TMDB_KEY;

  // Fetch favorites from backend
  useEffect(() => {
    if (!token && !isOwnProfile) {
      console.warn("No token found! Please log in.");
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        let url = "";
        let headers = {};

        if (isPublicView) {
          url = `${process.env.REACT_APP_API_URL}/favorites/user/${username}`;
        } else {
          url = `${process.env.REACT_APP_API_URL}/favorites`;
          headers = { Authorization: `Bearer ${token}` };
        }

        const res = await fetch(url, { headers });
        const data = await res.json();

        const favs = data.favorites || [];

        // Enrich with TMDB data
        const enriched = await Promise.all(
          favs.map(async (fav) => {
            try {
              const tmdbRes = await fetch(
                `https://api.themoviedb.org/3/movie/${fav.movie_tmdb_id}?api_key=${TMDB_KEY}`
              );
              const tmdbData = await tmdbRes.json();

              return {
                movie_tmdb_id: fav.movie_tmdb_id,
                poster_path: tmdbData.poster_path,
                title: tmdbData.title,
                rating: tmdbData.vote_average,
                release_date: tmdbData.release_date,
              };
            } catch (err) {
              console.error("TMDB fetch error:", err);
              return { movie_tmdb_id: fav.movie_tmdb_id, title: "Unknown Movie" };
            }
          })
        );

        setFavorites(enriched);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token, TMDB_KEY, username, isPublicView, isOwnProfile]);

  // Remove favorite (only for logged-in user's own profile)
  const removeFavorite = (movieTmdbId) => {
    if (!user || !isOwnProfile) return;

    fetch(`${process.env.REACT_APP_API_URL}/favorites/${movieTmdbId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setFavorites((prev) => prev.filter((f) => f.movie_tmdb_id !== movieTmdbId));
      })
      .catch((err) => console.error("Error removing favorite:", err));
  };

  return (
    <main className="favorites-page">
      <div className="favorites-content">
        {isOwnProfile && user && <ProfileSidebar />}

        <div className="favorites-main">
          <h1>{isPublicView ? `${username}'s Favorites` : "Your Favorites"}</h1>

          {loading ? (
            <p className="favorites-loading">Loading favorite movies...</p>
          ) : favorites.length === 0 ? (
            <p className="favorites-empty">No favorites yet.</p>
          ) : (
            <div className="favorites-grid">
              {favorites.map((fav) => (
                <div key={fav.movie_tmdb_id} className="favorite-card">
                  <img
                    src={
                      fav.poster_path
                        ? `https://image.tmdb.org/t/p/w300${fav.poster_path}`
                        : "/no-image.jpg"
                    }
                    alt={fav.title}
                    className="favorite-poster"
                  />

                  <h3 className="favorite-title">{fav.title}</h3>

                  {fav.rating && <p className="favorite-rating">⭐ {fav.rating.toFixed(1)}</p>}

                  {user && isOwnProfile && (
                    <button
                      className="remove-favorite-btn"
                      onClick={() => removeFavorite(fav.movie_tmdb_id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Favorites;
