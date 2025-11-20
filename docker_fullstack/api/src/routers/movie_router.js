import { Router } from "express";
import {
  getNowPlayingMovies,
  searchMovies,
  getMovieById,
} from "../controllers/movie_controller.js";

const movieRouter = Router();

movieRouter.get("/now_playing", getNowPlayingMovies);
movieRouter.get("/search", searchMovies);
movieRouter.get("/:movieId", getMovieById);

export default movieRouter;
