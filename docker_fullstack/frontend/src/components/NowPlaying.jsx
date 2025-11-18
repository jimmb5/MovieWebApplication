import React, { useEffect, useState } from "react";
import axios from "axios";
import MediaContainer from "./MediaContainer";

export default function NowPlaying() {
  const [movies, setMovies] = useState([]);
  const title = "Now Playing in Finland";

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
    <div>
      <MediaContainer title={title} mediaItems={movies} />
    </div>
  );
}
