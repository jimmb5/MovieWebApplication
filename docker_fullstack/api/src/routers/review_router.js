import { Router } from "express";
import {
  createReview,
  getMovieReviews,
  updateReview,
  deleteReview,
  getMovieRating,
} from "../controllers/review_controller.js";
import { authenticateToken } from "../middleware/auth.js";

const reviewRouter = Router();

reviewRouter.post("/", authenticateToken, createReview);
reviewRouter.get("/movie/:movieId", getMovieReviews);
reviewRouter.put("/:reviewId", authenticateToken, updateReview);
reviewRouter.delete("/:reviewId", authenticateToken, deleteReview);
reviewRouter.get("/movie/:movieId/rating", getMovieRating);

export default reviewRouter;
