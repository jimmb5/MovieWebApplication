import React from "react";
import MediaContainer from "./MediaContainer";

export default function SearchResults({ results, showResults }) {
  const title = "Search Results";

  if (!showResults) return null;
  else
    return (
      <div>
        <MediaContainer title={title} mediaItems={results} />
      </div>
    );
}
