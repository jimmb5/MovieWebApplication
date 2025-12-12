import SearchResults from "../components/SearchResults";
import NowPlaying from "../components/NowPlaying";
import SearchBar from "../components/SearchBar";
import React, { useState } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleSearch = async (newTerm) => {
    setSearchTerm(newTerm);

    if (!newTerm) {
      setShowResults(false);
      return;
    }
    setPage(1);

    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/search/movies?query=${newTerm}&page=1`
      )
      .then((response) => {
        setResults(response.data);
        setShowResults(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  async function fetchMoreResults(term, newPage) {
    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/search/movies?query=${term}&page=${newPage}`
      )
      .then((response) => {
        setResults((prev) => [...prev, ...response.data]);
        setPage(newPage);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div className="home">
      <main className="home-content">
        <div className="search-container">
          <SearchBar onSearch={handleSearch} />
          <button
            onClick={() => {
              fetchMoreResults(searchTerm, page + 1);
            }}
          >
            hae lisää
          </button>
          <p>sivu numero: {page}</p>
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
