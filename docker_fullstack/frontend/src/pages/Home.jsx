import SearchResults from "../components/SearchResults";
import NowPlaying from "../components/NowPlaying";
import SearchBar from "../components/SearchBar";
import React, { useState } from "react";
import "./Home.css";

function Home() {
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  return (
    <div className="home">
      <main className="home-content">
        <div className="search-container">
          <SearchBar setResults={setResults} setShowResults={setShowResults} />
        </div>
        <SearchResults results={results} showResults={showResults} />
        <div className="now-playing-container">
          <NowPlaying />
        </div>
      </main>
    </div>
  );
}

export default Home;
