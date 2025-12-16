import SearchResults from "../components/SearchResults";
import NowPlaying from "../components/NowPlaying";
import SearchBar from "../components/SearchBar";
import React, { useCallback, useState, useRef } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [backdrop, setBackdrop] = useState();

  const handleSearch = async (newTerm) => {
    setSearchTerm(newTerm);
    if (!newTerm) {
      setShowResults(false);
      setPage(1);
      setHasMore(false);
      return;
    }
    setHasMore(true);
    setPage(1);

    await axios
      .get(
        `${process.env.REACT_APP_API_URL}/search/movies?query=${newTerm}&page=1`
      )
      .then((response) => {
        setResults(response.data.results);
        setShowResults(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  async function fetchMoreResults(term, newPage) {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/search/movies?query=${term}&page=${newPage}`
      );
      setResults((prev) => [...prev, ...response.data.results]);
      setPage(newPage);
      setHasMore(newPage < response.data.totalPages);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }

  const loadMore = useCallback(() => {
    if (loading) return;
    fetchMoreResults(searchTerm, page + 1);
  }, [searchTerm, page, fetchMoreResults]);

  return (
    <div
      className="home"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.92), rgba(24, 24, 24, 0.81)),
          url(https://image.tmdb.org/t/p/original${backdrop})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <main className="home-content">
        <div className="search-container">
          <SearchBar onSearch={handleSearch} />
        </div>
        <SearchResults
          searchTerm={searchTerm}
          results={results}
          showResults={showResults}
          onLoadMore={loadMore}
          hasMore={hasMore}
          page={page}
          loading={loading}
        />
        <div className="now-playing-container">
          <NowPlaying backdrop={setBackdrop} />
        </div>
      </main>
    </div>
  );
}

export default Home;
