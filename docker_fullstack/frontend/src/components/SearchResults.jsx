import React from "react";
import MovieCard from "./MovieCard";
import "./NowPlaying.css";

export default function SearchResults({ results }) {
  return (
    <section className="now-playing">
      <h2>Search Results</h2>
      <div className="now-playing-grid">
        {results.map((movie) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            poster={movie.poster_path}
          />
        ))}
      </div>
    </section>
  );
}
