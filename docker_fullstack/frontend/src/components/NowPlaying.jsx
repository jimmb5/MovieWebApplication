import React, { useEffect, useState } from "react";
import axios from "axios";
import MediaCard from "./MediaCard";
import "./NowPlaying.css";

export default function NowPlaying() {
  const [movies, setMovies] = useState([]);
  const title = "Now Playing in Finland";

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/movie/now_playing`)
      .then((response) => {
        setMovies(response.data);
      })
      .catch((error) => {
        console.error(error);
        setMovies([]);
      });
  }, []);

  return (
    <div className="now-playing-wrapper">
      <h2 className="now-playing-title">{title}</h2>
      <div className="now-playing-scroll">
        {movies.map((movie) => (
          <div key={movie.id}>
            <MediaCard mediaItem={movie} />
          </div>
        ))}
      </div>
    </div>
  );
}
