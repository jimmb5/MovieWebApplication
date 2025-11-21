import { Router } from "express";
import { smartSearch } from "../controllers/search_controller.js";

const searchRouter = Router();

searchRouter.get("/movies", smartSearch);

export default searchRouter;
