import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { FaFilm, FaPaperPlane, FaTimes } from "react-icons/fa";
import { useGroup } from "../../contexts/GroupContext";
import { useAuth } from "../../contexts/AuthContext";
import "./GroupPostCreator.css";

function GroupPostCreator() {
  const { createPost } = useGroup();
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [movieQuery, setMovieQuery] = useState("");
  const [debouncedQuery] = useDebounce(movieQuery, 500);
  const [movieResults, setMovieResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchRef = useRef(null);

  // Hae elokuvia kun hakusana muuttuu
  useEffect(() => {
    if (showMovieSearch && debouncedQuery) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/movie/search?query=${debouncedQuery}`)
        .then((response) => {
          setMovieResults(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setMovieResults([]);
    }
  }, [debouncedQuery, showMovieSearch]);

  // Sulje elokuvahakutulokset kun klikataan sen ulkopuolelle
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMovieQuery("");
        setMovieResults([]);
        setShowMovieSearch(false);
      }
    };

    if (showMovieSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMovieSearch]);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setMovieQuery("");
    setMovieResults([]);
    setShowMovieSearch(false);
  };

  const handleRemoveMovie = () => {
    setSelectedMovie(null);
  };

  const toggleMovieSearch = () => {
    setShowMovieSearch((prev) => {
      if (prev) {
        setMovieQuery("");
        setMovieResults([]);
      }
      return !prev;
    });
  };

  const handleSubmit = async () => {
    if ((!description.trim() && !selectedMovie) || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createPost(
        description.trim() || null,
        selectedMovie?.id || null
      );

      if (success) {
        // Tyhjennetään lomake onnistuneen lähetyksen jälkeen
        setDescription("");
        setSelectedMovie(null);
        setShowMovieSearch(false);
        setMovieQuery("");
        setMovieResults([]);
      }
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getInitial = () => {
    if (!user || !user.username) return "?";
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <div className="group-post-creator">
      <div className="post-creator-content">
        <div className="post-creator-row">
          <div className="post-creator-avatar">
            <span className="avatar-initial">{getInitial()}</span>
          </div>
          <div className="post-creator-input-wrapper">
            <input
              className="post-creator-input"
              placeholder="Write something..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className={`tag-movie-icon-button ${
                showMovieSearch || selectedMovie ? "active" : ""
              }`}
              onClick={toggleMovieSearch}
              title={selectedMovie ? "Change movie" : "Tag movie"}
            >
              <FaFilm />
            </button>
          </div>
          <button 
            className="post-creator-button post-button" 
            type="button"
            disabled={(!description.trim() && !selectedMovie) || isSubmitting}
            onClick={handleSubmit}
            title="Post"
          >
            <FaPaperPlane />
          </button>
        </div>

        {showMovieSearch && (
          <div className="post-creator-movie-search" ref={searchRef}>
            <input
              type="text"
              className="post-creator-search-input"
              placeholder="Search for a movie..."
              value={movieQuery}
              onChange={(e) => setMovieQuery(e.target.value)}
              autoFocus
            />
            {movieResults.length > 0 && (
              <div className="post-creator-movie-results">
                {movieResults.slice(0, 5).map((movie) => (
                  <div
                    key={movie.id}
                    className="post-creator-movie-result-item"
                    onClick={() => handleMovieSelect(movie)}
                  >
                    {movie.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="movie-result-poster"
                      />
                    )}
                    <div className="movie-result-info">
                      <p className="movie-result-title">{movie.title}</p>
                      {movie.release_date && (
                        <p className="movie-result-year">
                          {new Date(movie.release_date).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedMovie && (
          <div className="post-creator-selected-movie">
            <div className="selected-movie-info">
              {selectedMovie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w200${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  className="selected-movie-poster"
                />
              )}
              <div className="selected-movie-details">
                <p className="selected-movie-title">{selectedMovie.title}</p>
                {selectedMovie.release_date && (
                  <p className="selected-movie-year">
                    {new Date(selectedMovie.release_date).getFullYear()}
                  </p>
                )}
              </div>
            </div>
            <button
              className="remove-movie-button"
              onClick={handleRemoveMovie}
              type="button"
            >
              <FaTimes size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupPostCreator;

