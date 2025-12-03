import SearchResults from "../components/SearchResults";
import NowPlaying from "../components/NowPlaying";
import SearchBar from "../components/SearchBar";
import React, { useState } from "react";
import "./Home.css";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  return (
    <div className="home">
      <main className="home-content">
        <div className="search-container">
          <SearchBar
            setSearchTerm={setSearchTerm}
            setResults={setResults}
            setShowResults={setShowResults}
          />
        </div>
        <SearchResults
          searchTerm={searchTerm}
          results={results}
          showResults={showResults}
        />
        <div className="now-playing-container">
          <NowPlaying />
        </div>
      </main>
    </div>
  );
}

export default Home;
