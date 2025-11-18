import {
    getAll,
    addOne,
    authenticateUser,
    saveRefreshToken,
    getUserByRefreshToken,
    clearRefreshToken,
    deleteOne,
    changeName,
    changeEmail,
    changePassword,
    getUserById
  } from "../models/user_model.js";
  import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
  } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
  
  // Hae kaikki käyttäjät
  export async function getUsers(req, res, next) {
    try {
      const users = await getAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
  
  // Rekisteröi uusi käyttäjä
  export async function addUser(req, res, next) {
    try {
      const { username, email, password } = req.body;
  
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email and password are required" });
      }

  
      const user = await addOne(username, email, password);
      res.status(201).json({ 
        message: "User created successfully", 
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      });
    } catch (err) {
      if (err.code === '23505') { // PostgreSQL unique violation
        // Tarkista kumpi kenttä aiheutti virheen
        if (err.constraint && err.constraint.includes('username')) {
          return res.status(409).json({ error: "Username already exists" });
        }
        if (err.constraint && err.constraint.includes('email')) {
          return res.status(409).json({ error: "Email already exists" });
        }
        return res.status(409).json({ error: "Username or email already exists" });
      }
      next(err);
    }
  }
  
  // Kirjaudu sisään
  export async function login(req, res, next) {
    try {
      const { username, password } = req.body;
  
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
  
      const user = await authenticateUser(username, password);
  
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
  
      // Luo tokenit
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
  
      // Tallenna refresh token tietokantaan
      await saveRefreshToken(user.id, refreshToken);
  
      // Aseta refresh token HTTP-only cookieen
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,                              // Ei JavaScript-pääsyä
        secure: process.env.NODE_ENV === "production", // HTTPS tuotannossa
        sameSite: "strict",                          // CSRF-suojaus
        maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 päivää
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
  
  // Päivitä access token
  export async function refreshAccessToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
  
      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token required" });
      }
  
      // Validoi refresh token
      const decoded = verifyRefreshToken(refreshToken);
  
      if (!decoded) {
        return res.status(403).json({ error: "Invalid or expired refresh token" });
      }
  
      // Tarkista että token on tietokannassa
      const user = await getUserByRefreshToken(refreshToken);
  
      if (!user) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }
  
      // Luo uusi access token
      const accessToken = generateAccessToken(user.id);
  
      res.json({ 
        accessToken,
        id: user.id,
        username: user.username,
        email: user.email
       });
    } catch (err) {
      next(err);
    }
  }
  
  // Kirjaudu ulos
  export async function logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
  
      if (refreshToken) {
        const user = await getUserByRefreshToken(refreshToken);
  
        if (user) {
          // Poista refresh token tietokannasta
          await clearRefreshToken(user.id);
        }
      }
  
      // Poista cookie
      res.clearCookie("refreshToken");
  
      res.json({ message: "Logout successful" });
    } catch (err) {
      next(err);
    }
  }

  export async function deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await deleteOne(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ message: `User ${user.username} with id ${user.id} deleted successfully` });
    } catch (err) {
      next(err);
    }
  }

  export async function changeUsername(req, res, next) {
    try {
      const { userId } = req.params;
      const { newUsername } = req.body;

      if (!newUsername) {
        return res.status(400).json({ error: "New username is required" });
      }

      const user = await changeName(userId, newUsername);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: `User with id ${user.id} username changed to ${newUsername}` });
    } catch (err) {
      if (err.code === '23505' && err.constraint && err.constraint.includes('username')) {
        return res.status(409).json({ error: "Username already exists" });
      }
      next(err);
    }
  }

  export async function changeUserEmail(req, res, next) {
    try {
      const { userId } = req.params;
      const { newEmail } = req.body;

      if (!newEmail) {
        return res.status(400).json({ error: "New email is required" });
      }

      const user = await changeEmail(userId, newEmail);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: `User ${user.username} with id ${user.id} email changed to ${newEmail}` });
    } catch (err) {
      if (err.code === '23505' && err.constraint && err.constraint.includes('email')) {
        return res.status(409).json({ error: "Email already exists" });
      }
      next(err);
    }
  }

  export async function changeUserPassword(req, res, next) {
    try {
      const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
      }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

      const updatedUser = await changePassword(userId, newPassword);

      res.json({ message: `User ${updatedUser.username} with id ${updatedUser.id} password changed` });
    } catch (err) {
      next(err);
    }
  }