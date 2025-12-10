import pool from "../database.js";

export default {
  // Add a favorite (duplicates automatically ignored)
  addFavorite: async ({ userId, movieTmdbId }) => {
    const sql = `
      INSERT INTO favourites (user_id, movie_tmdb_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, movie_tmdb_id) DO NOTHING;
    `;
    
    await pool.query(sql, [userId, movieTmdbId]);
    return { success: true };
  },

  // Remove a favorite
  removeFavorite: async (userId, movieTmdbId) => {
    const sql = `
      DELETE FROM favourites
      WHERE user_id = $1 AND movie_tmdb_id = $2;
    `;

    await pool.query(sql, [userId, movieTmdbId]);
    return { success: true };
  },

  // Get all favorites for a user
  getFavorites: async (userId) => {
    const sql = `
      SELECT movie_tmdb_id, added_at
      FROM favourites
      WHERE user_id = $1
      ORDER BY added_at DESC;
    `;
    const result = await pool.query(sql, [userId]);
    return result.rows;
  }
};
