import { Router } from "express";
import { getUsers, addUser, login, refreshAccessToken, logout } from "../controllers/user_controller.js";
import { authenticateToken } from "../middleware/auth.js";

const userRouter = Router();

// Julkiset reitit
userRouter.post("/register", addUser);
userRouter.post("/login", login);
userRouter.post("/refresh", refreshAccessToken);
userRouter.post("/logout", logout);

// Suojatut reitit (vaativat autentikoinnin)
userRouter.get("/", authenticateToken, getUsers);

export default userRouter;