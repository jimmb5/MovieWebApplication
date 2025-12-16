import React from "react";
import { useNavigate } from "react-router-dom";
import "./MediaCard.css";

export default function MediaCard({ mediaItem }) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/movie/${mediaItem.id}`, { state: mediaItem });
  };

  return (
    <div className="media">
      <div className="poster" onClick={handleClick}>
        <img
          src={`https://image.tmdb.org/t/p/w500${mediaItem.poster_path}`}
          alt={mediaItem.title}
        />
      </div>
      <h3>Tähtiarvostelu</h3>
    </div>
  );
}
