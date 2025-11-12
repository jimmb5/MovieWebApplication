import { Router } from "express";
import { getUsers, addUser, login, refreshAccessToken, logout, deleteUser, changeUsername, changeUserEmail, changeUserPassword } from "../controllers/user_controller.js";
import { authenticateToken } from "../middleware/auth.js";

const userRouter = Router();

// Julkiset reitit
userRouter.post("/register", addUser);
userRouter.post("/login", login);
userRouter.post("/refresh", refreshAccessToken);
userRouter.post("/logout", logout);

// Suojatut reitit (vaativat autentikoinnin)
userRouter.get("/", authenticateToken, getUsers);
userRouter.delete("/:userId", authenticateToken, deleteUser);
userRouter.put("/:userId/username", authenticateToken, changeUsername);
userRouter.put("/:userId/email", authenticateToken, changeUserEmail);
userRouter.put("/:userId/password", authenticateToken, changeUserPassword);

export default userRouter;