import React from "react";
import "./MediaCard.css";

export default function MediaCard({ title, poster }) {
  return (
    <div className="media">
      <div className="poster">
        <img src={`https://image.tmdb.org/t/p/w500${poster}`} alt={title} />
      </div>
      <h3>{title}</h3>
    </div>
  );
}
