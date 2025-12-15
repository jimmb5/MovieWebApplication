import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import "./SearchBar.css";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  useEffect(() => {
    onSearch(debouncedQuery);
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
