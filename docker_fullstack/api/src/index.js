import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import userRouter from "./routers/user_router.js";

import groupsRouter from "./routers/groups_router.js";
import movieRouter from "./routers/movie_router.js";
import searchRouter from "./routers/search_router.js";
import reviewRouter from "./routers/review_router.js";

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Allow cookies
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", async (req, res) => {
  res.send("Postgres API esimerkki toimii!");
});

app.use("/user", userRouter);
app.use("/movie", movieRouter);
app.use("/search", searchRouter);
app.use("/groups", groupsRouter);
app.use("/review", reviewRouter);

// Käynnistä serveri vain jos EI olla testimoodissa
if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Server is listening on port ${port}`));
}

export default app;
