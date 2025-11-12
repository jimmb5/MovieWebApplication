import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieCard from "./MovieCard";
import "./NowPlaying.css";

export default function NowPlaying() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/movie/now_playing")
      .then((response) => {
        setMovies(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <section className="now-playing">
      <h2>Now Playing in Finland</h2>
      <div className="now-playing-grid">
        {movies.map((movie) => (
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
