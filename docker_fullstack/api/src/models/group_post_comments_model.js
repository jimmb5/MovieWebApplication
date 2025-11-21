import pool from "../database.js";

// Luo uusi kommentti
export async function addOne(groupPostId, authorId, comment) {
  const result = await pool.query(
    `INSERT INTO group_post_comments (group_post_id, author_id, comment) 
     VALUES ($1, $2, $3) 
     RETURNING id, group_post_id, author_id, comment, created_at, updated_at`,
    [groupPostId, authorId, comment]
  );
  return result.rows[0];
}

// Hae kaikki kommentit julkaisulle
export async function getByPostId(postId) {
  const result = await pool.query(
    `SELECT gpc.id, gpc.group_post_id, gpc.author_id, gpc.comment, 
            gpc.created_at, gpc.updated_at,
            u.username as author_username
     FROM group_post_comments gpc
     JOIN users u ON gpc.author_id = u.id
     WHERE gpc.group_post_id = $1
     ORDER BY gpc.created_at ASC`,
    [postId]
  );
  return result.rows;
}

// Hae yksi kommentti ID:n perusteella
export async function getOne(commentId) {
  const result = await pool.query(
    `SELECT gpc.id, gpc.group_post_id, gpc.author_id, gpc.comment, 
            gpc.created_at, gpc.updated_at,
            u.username as author_username
     FROM group_post_comments gpc
     JOIN users u ON gpc.author_id = u.id
     WHERE gpc.id = $1`,
    [commentId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Päivitä kommentti
export async function updateOne(commentId, comment) {
  const result = await pool.query(
    `UPDATE group_post_comments 
     SET comment = $1, updated_at = now() 
     WHERE id = $2 
     RETURNING id, group_post_id, author_id, comment, created_at, updated_at`,
    [comment, commentId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Poista kommentti
export async function deleteOne(commentId) {
  const result = await pool.query(
    "DELETE FROM group_post_comments WHERE id = $1 RETURNING id, group_post_id, author_id",
    [commentId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Tarkista onko käyttäjä kommentin omistaja
export async function isAuthor(commentId, userId) {
  const result = await pool.query(
    "SELECT author_id FROM group_post_comments WHERE id = $1 AND author_id = $2",
    [commentId, userId]
  );
  return result.rows.length > 0;
}

