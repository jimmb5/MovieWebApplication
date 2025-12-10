import pool from "../database.js";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

const userModel = {
  addOne: async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, hashedPassword]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await pool.query("SELECT id, username, email, created_at FROM users");
    return result.rows;
  },

  authenticateUser: async (username, password) => {
    const result = await pool.query(
      "SELECT id, username, email, password FROM users WHERE username = $1",
      [username]
    );
    if (result.rows.length === 0) return null;
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? { id: user.id, username: user.username, email: user.email } : null;
  },

  getUserById: async (userId) => {
    const result = await pool.query(
      "SELECT id, username, email, password FROM users WHERE id = $1",
      [userId]
    );
    return result.rows[0] || null;
  },

  saveRefreshToken: async (userId, refreshToken) => {
    const result = await pool.query(
      "UPDATE users SET refresh_token = $1 WHERE id = $2 RETURNING id, username, email",
      [refreshToken, userId]
    );
    return result.rows[0];
  },

  getUserByRefreshToken: async (refreshToken) => {
    const result = await pool.query(
      "SELECT id, username, email FROM users WHERE refresh_token = $1",
      [refreshToken]
    );
    return result.rows[0] || null;
  },

  clearRefreshToken: async (userId) => {
    const result = await pool.query(
      "UPDATE users SET refresh_token = NULL WHERE id = $1 RETURNING id, username, email",
      [userId]
    );
    return result.rows[0];
  },

  deleteOne: async (userId) => {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, username, email",
      [userId]
    );
    return result.rows[0];
  },

  changeName: async (userId, newUsername) => {
    const result = await pool.query(
      "UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email",
      [newUsername, userId]
    );
    return result.rows[0] || null;
  },

  changeEmail: async (userId, newEmail) => {
    const result = await pool.query(
      "UPDATE users SET email = $1 WHERE id = $2 RETURNING id, username, email",
      [newEmail, userId]
    );
    return result.rows[0] || null;
  },

  changePassword: async (userId, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username, email",
      [hashedPassword, userId]
    );
    return result.rows[0] || null;
  },

  // New helper for favorites controller:
  findByUsername: async (username) => {
    const result = await pool.query(
      "SELECT id, username, email FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0] || null;
  }
};

export default userModel;
