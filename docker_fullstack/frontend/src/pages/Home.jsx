import SearchResults from "../components/SearchResults";
import NowPlaying from "../components/NowPlaying";
import SearchBar from "../components/SearchBar";
import React, { useState } from "react";
import "./Home.css";

function Home() {
  const [results, setResults] = useState([]);
  return (
    <div className="home">
      <main className="home-content">
        <h1>Asd </h1>
        <p>Asd asd asd</p>
        <div className="search-container">
          <SearchBar setResults={setResults} />
        </div>
        <SearchResults results={results} />
        <div className="now-playing-container">
          <NowPlaying />
        </div>
      </main>
    </div>
  );
}

export default Home;
