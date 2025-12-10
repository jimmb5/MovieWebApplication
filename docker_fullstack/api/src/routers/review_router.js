import { Router } from "express";
import {
createReview,
getMovieReviews,
updateReview,
deleteReview
} from "../controllers/review_controller.js";
import { authenticateToken } from "../middleware/auth.js";

const reviewRouter = Router();

reviewRouter.post("/:movieId", authenticateToken, createReview);
reviewRouter.get("/movie/:movieId", getMovieReviews);
reviewRouter.put("/:reviewId",  authenticateToken, updateReview);
reviewRouter.delete("/:reviewId", authenticateToken,  deleteReview);

export default reviewRouter;