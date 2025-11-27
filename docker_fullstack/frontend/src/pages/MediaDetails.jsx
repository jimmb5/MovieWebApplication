import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MediaDetails.css";
import axios from "axios";

export default function MediaDetails() {
  const { id } = useParams();

  const [mediaItem, setMediaItem] = useState({});
  const title = mediaItem.title;
  const overview = mediaItem.overview;
  const backdrop = mediaItem.backdrop;
  const poster = mediaItem.poster;
  const releaseYear = mediaItem.year;
  const cast = mediaItem.cast;
  const director = mediaItem.director;
  const writers = mediaItem.writers;
  const runtime = mediaItem.runtime;
  const genres = mediaItem.genres;
  const ageRating = mediaItem.ageRating;

  function addSpace(items) {
    return items?.map((item) => <span key={item}>{item}</span>);
  }

  useEffect(() => {
    axios
      .get(`http://localhost:3001/movie/${id}`)
      .then((response) => {
        setMediaItem(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div
      className="media-details"
      style={{
        backgroundImage: `
    linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)),
    url(https://image.tmdb.org/t/p/original${backdrop})
  `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <main className="media-details-content">
        <div className="details-layout">
          <div className="poster">
            <img src={`https://image.tmdb.org/t/p/w500${poster}`} alt={title} />
          </div>

          <div className="details">
            <div className="header-row">
              <h1>{title}</h1>
              <button>Lisää suosikiksi</button>
            </div>

            <div className="meta-row darker-text">
              <span>{releaseYear}</span>

              <span>{runtime}</span>

              <span>{ageRating}</span>
            </div>

            <div className="description-row">
              <h2>Overview</h2>
              <p>{overview}</p>
            </div>

            <div className="info-table-row">
              <span className="darker-text">Starring</span>
              <span className="cast-crew-genres">{addSpace(cast)}</span>

              <span className="darker-text">Director</span>
              <span className="cast-crew-genres">{director}</span>

              <span className="darker-text">Writers</span>
              <span className="cast-crew-genres">{addSpace(writers)}</span>

              <span className="darker-text">Genre</span>
              <span className="cast-crew-genres">{addSpace(genres)}</span>
            </div>

            <div className="rating-row">tähtiarvostelu</div>
          </div>
        </div>
      </main>
    </div>
  );
}
