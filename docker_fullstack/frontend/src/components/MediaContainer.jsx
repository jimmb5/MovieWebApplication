import React from "react";
import MediaCard from "./MediaCard";
import "./MediaContainer.css";

export default function MediaContainer({ title, mediaItems }) {
  // tarkistetaan onko poster_path null sekä ettei ole duplikaatti id:tä
  const seen = new Set();
  const filteredItems = mediaItems.filter((item) => {
    if (item.poster_path === null) return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  return (
    <section className="media-container">
      <h2>{title}</h2>
      <div className="media-grid">
        {filteredItems.map((item) => (
          <MediaCard key={item.id} mediaItem={item} />
        ))}
      </div>
    </section>
  );
}
