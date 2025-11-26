import React from "react";
import { useLocation, useParams } from "react-router-dom";
import "./MediaDetails.css";

export default function MediaDetails() {
  const { id } = useParams();
  const location = useLocation();
  const mediaItem = location.state;
  const title = mediaItem.title || mediaItem.name;
  const overview = mediaItem.overview;

  return (
    <div
      className="media-details"
      style={{
        backgroundImage: `
    linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)),
    url(https://image.tmdb.org/t/p/original${mediaItem.backdrop_path})
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
            <img
              src={`https://image.tmdb.org/t/p/w500${mediaItem.poster_path}`}
              alt={title}
            />
          </div>

          <div className="details">
            <div className="header-row">
              <h1>{title}</h1>
              <button>Lisää suosikiksi</button>
            </div>

            <div className="meta-row darker-text">
              <span>year</span>

              <span>duration</span>

              <span>ageRating</span>
            </div>

            <div className="description-row">
              <h2>Overview</h2>
              <p>{overview}</p>
            </div>

            <div className="info-table-row">
              <span className="darker-text">Starring</span>
              <span>cast</span>

              <span className="darker-text">Director</span>
              <span>director</span>

              <span className="darker-text">Writer</span>
              <span>writer</span>

              <span className="darker-text">Genre</span>
              <span>genre</span>
            </div>

            <div className="rating-row">tähtiarvostelu</div>
          </div>
        </div>
      </main>
    </div>
  );
}
