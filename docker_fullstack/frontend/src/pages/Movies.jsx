import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Movies.css";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastMovieElementRef = useRef(null);

  const fetchMovies = async (pageNum) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/movie/popular?page=${pageNum}`
      );
      
      if (pageNum === 1) {
        setMovies(response.data.results);
      } else {
        setMovies((prev) => [...prev, ...response.data.results]);
      }
      
      setHasMore(pageNum < response.data.totalPages);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(1);
  }, []);

 // infinite scroll
  useEffect(() => {
    if (!hasMore || loading || currentPage === 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
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
  }, [currentPage, hasMore, loading]);


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
                </div>
              </Link>
            );
          })}
        </div>
        {loading && (
          <div className="movies-loading">Loading movies...</div>
        )}
        {!hasMore && movies.length > 0 && (
          <div className="movies-end">All movies loaded</div>
        )}
      </div>
    </div>
  );
}

