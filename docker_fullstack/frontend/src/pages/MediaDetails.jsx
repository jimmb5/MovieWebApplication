import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MediaDetails.css";
import axios from "axios";
import Review from "../components/Review";
import ReviewGet from "../components/ReviewGet";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import StarRating from "../components/StarRating";
import FavoriteButton from "../components/FavoriteButton";

export default function MediaDetails() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const { addToast } = useToast();
  const [mediaItem, setMediaItem] = useState({});
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);

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
      .get(`${process.env.REACT_APP_API_URL}/movie/${id}`)
      .then((response) => {
        setMediaItem(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]);

  const handleReviewSubmitted = () => {
    setReviewsRefreshTrigger((prev) => prev + 1);
  };

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
              <FavoriteButton movieId={id} />
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
            <div className="rating-row darker-text">
              <div>
                <p>User ratings:</p>
                <br />
                <StarRating
                  movieId={id}
                  size={50}
                  showInfo={true}
                  key={reviewsRefreshTrigger}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="review">
          <Review movieId={id} onReviewSubmitted={handleReviewSubmitted} />

          <ReviewGet movieId={id} refreshTrigger={reviewsRefreshTrigger} />
        </div>
      </main>
    </div>
  );
}
