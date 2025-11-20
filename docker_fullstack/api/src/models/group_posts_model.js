import pool from "../database.js";

// Luo uusi julkaisu
export async function addOne(groupId, authorId, movieTmdbId, description) {
  const result = await pool.query(
    `INSERT INTO group_posts (group_id, author_id, movie_tmdb_id, description) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, group_id, author_id, movie_tmdb_id, description, created_at, updated_at`,
    [groupId, authorId, movieTmdbId || null, description || null]
  );
  return result.rows[0];
}

// Hae kaikki ryhmän julkaisut
export async function getByGroupId(groupId) {
  const result = await pool.query(
    `SELECT gp.id, gp.group_id, gp.author_id, gp.movie_tmdb_id, gp.description, 
            gp.created_at, gp.updated_at,
            u.username as author_username
     FROM group_posts gp
     JOIN users u ON gp.author_id = u.id
     WHERE gp.group_id = $1
     ORDER BY gp.created_at DESC`,
    [groupId]
  );
  return result.rows;
}

// Hae yksi julkaisu ID:n perusteella
export async function getOne(postId) {
  const result = await pool.query(
    `SELECT gp.id, gp.group_id, gp.author_id, gp.movie_tmdb_id, gp.description, 
            gp.created_at, gp.updated_at,
            u.username as author_username
     FROM group_posts gp
     JOIN users u ON gp.author_id = u.id
     WHERE gp.id = $1`,
    [postId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Päivitä julkaisu
export async function updateOne(postId, description, movieTmdbId) {
  const result = await pool.query(
    `UPDATE group_posts 
     SET description = $1, movie_tmdb_id = $2, updated_at = now() 
     WHERE id = $3 
     RETURNING id, group_id, author_id, movie_tmdb_id, description, created_at, updated_at`,
    [description || null, movieTmdbId || null, postId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Poista julkaisu
export async function deleteOne(postId) {
  const result = await pool.query(
    "DELETE FROM group_posts WHERE id = $1 RETURNING id, group_id, author_id",
    [postId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Tarkista onko käyttäjä julkaisun omistaja
export async function isAuthor(postId, userId) {
  const result = await pool.query(
    "SELECT author_id FROM group_posts WHERE id = $1 AND author_id = $2",
    [postId, userId]
  );
  return result.rows.length > 0;
}

