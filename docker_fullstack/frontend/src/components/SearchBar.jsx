import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import axios from "axios";
import "./SearchBar.css";

export default function SearchBar({
  setSearchTerm,
  setResults,
  setShowResults,
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  useEffect(() => {
    if (debouncedQuery) {
      axios
        .get(`http://localhost:3001/search/movies?query=${debouncedQuery}`)
        .then((response) => {
          setSearchTerm(debouncedQuery);
          setResults(response.data);
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
        placeholder="Search movies by title, cast member or genre"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
