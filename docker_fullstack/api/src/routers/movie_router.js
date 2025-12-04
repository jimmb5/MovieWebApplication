import { Router } from "express";
import {
  getNowPlayingMovies,
  getMovieById,
  getPopularMovies,
} from "../controllers/movie_controller.js";

const movieRouter = Router();

movieRouter.get("/now_playing", getNowPlayingMovies);
movieRouter.get("/popular", getPopularMovies);
movieRouter.get("/:movieId", getMovieById);

export default movieRouter;
