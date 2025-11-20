import { Router } from "express";
import {
  //   findGenre,
  smartSearch,
} from "../controllers/search_controller.js";

const searchRouter = Router();

// searchRouter.get("/genre", findGenre);
searchRouter.get("/smart", smartSearch);

export default searchRouter;
