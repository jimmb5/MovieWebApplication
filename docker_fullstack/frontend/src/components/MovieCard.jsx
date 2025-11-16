import React from "react";
import "./MovieCard.css";

export default function MovieCard({ title, poster }) {
  return (
    <div className="movie">
      <div className="poster">
        <img src={`https://image.tmdb.org/t/p/w500${poster}`} alt={title} />
      </div>
      <h3>{title}</h3>
    </div>
  );
}
