import { Router } from "express";
import { getNowPlayingMovies } from "../controllers/movie_controller.js";

const movieRouter = Router();

movieRouter.get("/now_playing", getNowPlayingMovies);

export default movieRouter;
