import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getNowPlayingMovies(req, res, next) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Virhe haettaessa elokuvia" });
  }
}
