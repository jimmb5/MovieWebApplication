import pool from "../database.js";

// luo uusi arvostlu
export async function addOne(userId, movieId, reviewId, rating, comment) {
  const result = await pool.query(
    `INSERT INTO user_movie_ratings (user_id, movie_id, review_id, rating, comment) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING user_id, movie_id, rating, comment, created_at`,
    [userId, movieId, reviewId, rating, comment]
  );
  return result.rows[0];
}

// hae kaikki arvostelut
export async function getByReviewId(reviewId) {
  const result = await pool.query(
    `SELECT umr.user_id, umr.movie_id, umr.rating, umr.comment, umr.created_at,
            u.username as author_username
     FROM user_movie_ratings umr
     JOIN users u ON umr.user_id = u.id
     WHERE umr.review_id = $1
     ORDER BY umr.created_at ASC`,
    [reviewId]
  );
  return result.rows;
}

//hae arvostelut tieylle elokuvalle
export async function getByMovieId(movieId) {
  const result = await pool.query(
    `SELECT umr.user_id, umr.movie_id, umr.rating, umr.comment, umr.created_at,
            u.username as author_username
     FROM user_movie_ratings umr
     JOIN users u ON umr.user_id = u.id
     WHERE umr.movie_id = $1
     ORDER BY umr.created_at ASC`,
    [movieId]
  );
  return result.rows;
}

// päivitä arvostelu
export async function updateOne(userId, movieId, rating, comment) {
  const result = await pool.query(
    `UPDATE user_movie_ratings 
     SET rating = $1, comment = $2, created_at = now() 
     WHERE user_id = $3 AND movie_id = $4 
     RETURNING user_id, movie_id, rating, comment, created_at`,
    [rating, comment, userId, movieId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// poista arvostelu
export async function deleteOne(userId, movieId) {
  const result = await pool.query(
    "DELETE FROM user_movie_ratings WHERE user_id = $1 AND movie_id = $2 RETURNING user_id, movie_id",
    [userId, movieId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// tarkista onko käyttäjä jo arvostellut elokuvan
export async function hasReviewed(userId, movieId) {
  const result = await pool.query(
    `SELECT 1 FROM user_movie_ratings 
     WHERE user_id = $1 AND movie_id = $2`,
    [userId, movieId]
  );
  return result.rows.length > 0;
}

// tarkist ha onko käyttäjä arvostelun omistaja
export async function isAuthor(reviewId, userId) {
  const result = await pool.query(
    `SELECT 1 FROM user_movie_ratings 
     WHERE review_id = $1 AND user_id = $2`,
    [reviewId, userId]
  );
  return result.rows.length > 0;
}




