import pool from "../database.js";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

// Luo käyttäjä
export async function addOne(username, email, password) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
    [username, email, hashedPassword]
  );
  return result.rows[0];
}

// Hae kaikki käyttäjät
export async function getAll() {
  const result = await pool.query("SELECT id, username, email, created_at FROM users");
  return result.rows;
}

// Validoi käyttäjä kirjautumisessa
export async function authenticateUser(username, password) {
  const result = await pool.query(
    "SELECT id, username, email, password FROM users WHERE username = $1",
    [username]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password);

  if (isValid) {
    return { id: user.id, username: user.username, email: user.email };
  }

  return null;
}

// Tallenna refresh token
export async function saveRefreshToken(userId, refreshToken) {
  const result = await pool.query(
    "UPDATE users SET refresh_token = $1 WHERE id = $2 RETURNING id, username, email",
    [refreshToken, userId]
  );
  return result.rows[0];
}

// Hae käyttäjä refresh tokenin perusteella
export async function getUserByRefreshToken(refreshToken) {
  const result = await pool.query(
    "SELECT id, username, email FROM users WHERE refresh_token = $1",
    [refreshToken]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Poista refresh token (logout)
export async function clearRefreshToken(userId) {
  const result = await pool.query(
    "UPDATE users SET refresh_token = NULL WHERE id = $1 RETURNING id, username, email",
    [userId]
  );
  return result.rows[0];
}