import React, { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";
import "./FavoriteButton.css";

export default function FavoriteButton({ movieId }) {
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!accessToken) {
        setIsFavorite(false);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/favorites`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const favIds = res.data.favorites.map((f) => f.movie_tmdb_id);
        setIsFavorite(favIds.includes(Number(movieId)));
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        setIsFavorite(false);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteStatus();
  }, [movieId, accessToken]);

  const toggleFavorite = async () => {
    if (!accessToken) {
      addToast("You must be logged in to add favorites", "error");
      return;
    }

    try {
      if (!isFavorite) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/favorites`,
          { movie_tmdb_id: movieId },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setIsFavorite(true);
        addToast("Added to favorites!", "success");
      } else {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/favorites/${movieId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setIsFavorite(false);
        addToast("Removed from favorites!", "success");
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
      addToast(err.response?.data?.error || "Something went wrong", "error");
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    toggleFavorite();
  };

  if (loading) {
    return (
      <button className="favorite-button" disabled>
        <FaHeart color="gray" />
      </button>
    );
  }

  return (
    <button
      className={`favorite-button ${isFavorite ? "favorite" : ""}`}
      onClick={handleClick}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <FaHeart className="heart" />
    </button>
  );
}
