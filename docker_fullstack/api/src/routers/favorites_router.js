
import { Router } from "express";
import favoritesController from "../controllers/favorites_controller.js";
import { authenticateToken } from "../middleware/auth.js";

const favoritesRouter = Router();

favoritesRouter.get("/user/:username", favoritesController.getFavoritesByUsername);

favoritesRouter.post("/",authenticateToken, favoritesController.addFavorite);
favoritesRouter.delete("/:movieTmdbId", authenticateToken, favoritesController.removeFavorite);
favoritesRouter.get("/", authenticateToken, favoritesController.getFavorites);

export default favoritesRouter;
