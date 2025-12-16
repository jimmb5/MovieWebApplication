import React, { useEffect, useState } from "react";
import axios from "axios";
import MediaCard from "./MediaCard";
import "./NowPlaying.css";

export default function NowPlaying({ backdrop }) {
  const [movies, setMovies] = useState([]);
  const title = "Now Playing in Finland";

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/movie/now_playing`)
      .then((response) => {
        const data = response.data;
        setMovies(data);

        if (data.length > 0) {
          const randomMovie = data[getRandomInt(0, data.length - 1)];
          backdrop(randomMovie.backdrop_path);
        }
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
