import favoritesModel from "../models/favorites_model.js";
import userModel from "../models/user_model.js"; 

export default {
  // POST /favorites
  addFavorite: async (req, res) => {
    try {
      const userId = req.user.userId; // from token
      const movieTmdbId = req.body.movie_tmdb_id;

      await favoritesModel.addFavorite({ userId, movieTmdbId });

      res.status(201).json({
        success: true,
        message: "Movie added to favorites",
        movieTmdbId
      });
    } catch (err) {
      console.error("addFavorite error:", err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  // DELETE /favorites/:movieTmdbId
  removeFavorite: async (req, res) => {
    try {
      const userId = req.user.userId; // from token
      const movieTmdbId = req.params.movieTmdbId;

      await favoritesModel.removeFavorite(userId, movieTmdbId);

      res.status(200).json({
        success: true,
        message: "Movie removed from favorites",
        movieTmdbId
      });
    } catch (err) {
      console.error("removeFavorite error:", err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  // GET /favorites (private)
  getFavorites: async (req, res) => {
    try {
      const userId = req.user.userId;

      const favorites = await favoritesModel.getFavorites(userId);

      res.status(200).json({
        success: true,
        favorites
      });
    } catch (err) {
      console.error("getFavorites error:", err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  },

  // ⭐ GET /favorites/user/:username (public)
  getFavoritesByUsername: async (req, res) => {
    try {
      const { username } = req.params;

      // Find user by username
      const user = await userModel.findByUsername(username); 
      // <-- adjust method to your model. Must return { id, username, ... }

      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      // Get favorites for that user
      const favorites = await favoritesModel.getFavorites(user.id);

      res.status(200).json({
        success: true,
        favorites
      });
    } catch (err) {
      console.error("getFavoritesByUsername error:", err);
      res.status(500).json({ success: false, error: "Server error" });
    }
  }
};
