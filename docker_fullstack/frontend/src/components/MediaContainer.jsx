import React from "react";
import MediaCard from "./MediaCard";
import "./MediaContainer.css";

export default function MediaContainer({ title, mediaItems }) {
  return (
    <section className="media-container">
      <h2>{title}</h2>
      <div className="media-grid">
        {mediaItems.map((item) => (
          <MediaCard
            key={item.id}
            title={item.title}
            poster={item.poster_path}
          />
        ))}
      </div>
    </section>
  );
}
