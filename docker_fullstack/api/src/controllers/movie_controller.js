import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getNowPlayingMovies(req, res, next) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/now_playing`,
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
