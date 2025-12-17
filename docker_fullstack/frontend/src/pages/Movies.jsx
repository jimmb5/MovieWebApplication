import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Movies.css";
import StarRating from "../components/StarRating";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastMovieElementRef = useRef(null);
  const loadingRef = useRef(false);

  const fetchMovies = useCallback(async (pageNum) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/movie/popular?page=${pageNum}`
      );

      if (pageNum === 1) {
        setMovies(response.data.results);
      } else {
        setMovies((prev) => [...prev, ...response.data.results]);
      }

      setHasMore(pageNum < response.data.totalPages);
      setCurrentPage(pageNum);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  // infinite scroll
  useEffect(() => {
    if (!hasMore || loading || movies.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore) {
          const nextPage = currentPage + 1;
          fetchMovies(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = lastMovieElementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [currentPage, hasMore, loading, fetchMovies, movies.length]);

  return (
    <div className="movies-page">
      <div className="movies-container">
        <h1 className="movies-title">Elokuvat</h1>
        <div className="movies-list">
          {movies.map((movie, index) => {
            const isLastMovie = index === movies.length - 1;

            return (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="movie-item"
                ref={isLastMovie ? lastMovieElementRef : null}
              >
                <div className="movie-poster">
                  {movie.poster ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster}`}
                      alt={movie.title}
                    />
                  ) : (
                    <div className="movie-poster-placeholder">No image</div>
                  )}
                </div>
                <div className="movie-info">
                  <h2 className="movie-title">{movie.title}</h2>
                  <p className="movie-year">{movie.year}</p>
                  <p className="movie-description">
                    {movie.overview || "No overview available"}
                  </p>
                  <div className="rating">
                    <StarRating movieId={movie.id} size={24} showInfo={false} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {loading && <div className="movies-loading">Loading movies...</div>}
        {!hasMore && movies.length > 0 && (
          <div className="movies-end">All movies loaded</div>
        )}
      </div>
    </div>
  );
}
