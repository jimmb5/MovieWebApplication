import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getNowPlayingMovies(req, res, next) {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "fi-FI",
          region: "FI",
          page: 1,
        },
      }
    );

    const top10 = response.data.results.slice(0, 10);
    res.json(top10);
  } catch (error) {
    res.status(500).json({ message: "Virhe haettaessa elokuvia" });
  }
}

export async function searchMovies(req, res, next) {
  try {
    const searchTerm = req.query.query;
    const response = await axios.get(
      "https://api.themoviedb.org/3/search/movie",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query: searchTerm,
          language: "fi-FI",
          region: "FI",
          page: 1,
        },
      }
    );

    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ message: "Virhe haettaessa elokuvia" });
  }
}

export async function getMovieById(req, res, next) {
  try {
    const { movieId } = req.params;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "fi-FI",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Virhe haettaessa elokuvaa" });
  }
}