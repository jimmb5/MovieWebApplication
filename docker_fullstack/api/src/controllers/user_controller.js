import userModel from "../models/user_model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";

// Helper functions
function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// GET all users
export async function getUsers(req, res, next) {
  try {
    const users = await userModel.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// Register new user
export async function addUser(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email is not valid" });
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) return res.status(400).json({ error: passwordValidationError });

    const user = await userModel.addOne(username, email, password);
    res.status(201).json({ 
      message: "User created successfully", 
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    });
  } catch (err) {
    if (err.code === "23505") { // unique violation
      if (err.constraint && err.constraint.includes("username")) return res.status(409).json({ error: "Username already exists" });
      if (err.constraint && err.constraint.includes("email")) return res.status(409).json({ error: "Email already exists" });
      return res.status(409).json({ error: "Username or email already exists" });
    }
    next(err);
  }
}

// Login
export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

    const user = await userModel.authenticateUser(username, password);
    if (!user) return res.status(401).json({ error: "Invalid username or password" });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await userModel.saveRefreshToken(user.id, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      id: user.id,
      username: user.username,
      email: user.email,
      accessToken
    });
  } catch (err) {
    next(err);
  }
}

// Refresh access token
export async function refreshAccessToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) return res.status(403).json({ error: "Invalid or expired refresh token" });

    const user = await userModel.getUserByRefreshToken(refreshToken);
    if (!user) return res.status(403).json({ error: "Invalid refresh token" });

    const accessToken = generateAccessToken(user.id);
    res.json({ accessToken, id: user.id, username: user.username, email: user.email });
  } catch (err) {
    next(err);
  }
}

// Logout
export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const user = await userModel.getUserByRefreshToken(refreshToken);
      if (user) await userModel.clearRefreshToken(user.id);
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Logout successful" });
  } catch (err) {
    next(err);
  }
}

// Delete user
export async function deleteUser(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await userModel.deleteOne(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: `User ${user.username} with id ${user.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
}

// Change username
export async function changeUsername(req, res, next) {
  try {
    const { userId } = req.params;
    const { newUsername } = req.body;
    if (!newUsername) return res.status(400).json({ error: "New username is required" });

    const user = await userModel.changeName(userId, newUsername);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: `User with id ${user.id} username changed to ${newUsername}` });
  } catch (err) {
    if (err.code === "23505" && err.constraint && err.constraint.includes("username")) {
      return res.status(409).json({ error: "Username already exists" });
    }
    next(err);
  }
}

// Change email
export async function changeUserEmail(req, res, next) {
  try {
    const { userId } = req.params;
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ error: "New email is required" });
    if (!isValidEmail(newEmail)) return res.status(400).json({ error: "Email is not valid" });

    const user = await userModel.changeEmail(userId, newEmail);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: `User ${user.username} with id ${user.id} email changed to ${newEmail}` });
  } catch (err) {
    if (err.code === "23505" && err.constraint && err.constraint.includes("email")) {
      return res.status(409).json({ error: "Email already exists" });
    }
    next(err);
  }
}

// Change password
export async function changeUserPassword(req, res, next) {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }

    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) return res.status(400).json({ error: passwordValidationError });

    const user = await userModel.getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) return res.status(401).json({ error: "Current password is incorrect" });

    const updatedUser = await userModel.changePassword(userId, newPassword);
    res.json({ message: `User ${updatedUser.username} with id ${updatedUser.id} password changed` });
  } catch (err) {
    next(err);
  }
}
