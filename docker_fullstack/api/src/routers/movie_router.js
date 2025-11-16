import { Router } from "express";
import {
  getNowPlayingMovies,
  searchMovies,
} from "../controllers/movie_controller.js";

const movieRouter = Router();

movieRouter.get("/now_playing", getNowPlayingMovies);
movieRouter.get("/search", searchMovies);

export default movieRouter;
