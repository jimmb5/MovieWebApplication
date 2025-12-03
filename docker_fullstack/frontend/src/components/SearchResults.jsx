import React from "react";
import MediaContainer from "./MediaContainer";

export default function SearchResults({ searchTerm, results, showResults }) {
  const title = `${results.length} results for ${searchTerm}`;

  if (!showResults) return null;
  else
    return (
      <div>
        <MediaContainer title={title} mediaItems={results} />
      </div>
    );
}
