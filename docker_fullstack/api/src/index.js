import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { authenticateToken } from "./middleware/auth.js";
import userRouter from "./routers/user_router.js";

const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true // Allow cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", async (req, res) => {
  res.send("Postgres API esimerkki");
});

// Suojaamattomat reitit ellei endpoint määrittele toisin
// Esim. tmdb api kutsut tähän
app.use("/user", userRouter);

// ESIM. tulevaisuudessa suojatut reitit tähän eli kaikki reitit vaativat autentikoinnin:
// app.use("/groups", authenticateToken, groupsRouter);
// app.use("/movies", authenticateToken, moviesRouter);

app.listen(port, () => {
  console.log(`Server is listening port ${port}`);
});