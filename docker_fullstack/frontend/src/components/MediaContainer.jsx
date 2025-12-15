import React from "react";
import MediaCard from "./MediaCard";
import "./MediaContainer.css";

export default function MediaContainer({
  title,
  mediaItems,
  lastItemRef,
  loading,
}) {
  // tarkistetaan onko poster_path null sekä ettei ole duplikaatti id:tä
  const seen = new Set();
  const filteredItems = mediaItems.filter((item) => {
    if (item.poster_path === null) return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  // lisätään lastItemRef viimeiseen itemiin
  const media = filteredItems.map((item, index) => {
    const isLast = index === filteredItems.length - 1;

    if (isLast) {
      return (
        <div ref={lastItemRef} key={item.id}>
          <MediaCard mediaItem={item} />
        </div>
      );
    }
    return (
      <div key={item.id}>
        <MediaCard mediaItem={item} />
      </div>
    );
  });

  return (
    <section className="media-container">
      <h2>{title}</h2>
      <div>{loading && <div className="loading">Loading movies...</div>}</div>
      <div className="media-grid">{media}</div>
    </section>
  );
}
