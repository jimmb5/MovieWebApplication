import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import axios from "axios";
import "./SearchBar.css";

export default function SearchBar({ setResults, setShowResults }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  useEffect(() => {
    if (debouncedQuery) {
      axios
        .get(`http://localhost:3001/movie/search?query=${debouncedQuery}`)
        .then((response) => {
          setResults(response.data.results);
          setShowResults(true);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setShowResults(false);
    }
  }, [debouncedQuery]);

  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Search movies and shows by title, actor, or genre"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
