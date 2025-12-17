import React from "react";
import "./Review.css";
import ReviewStar from "./ReviewStar";
import { FaPaperPlane } from "react-icons/fa";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function Review({ movieId, onReviewSubmitted }) {
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { accessToken, user } = useAuth();
  const { addToast } = useToast();
  const [reviewText, setReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState(1);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim() || isSubmittingReview || !accessToken) return;

    setIsSubmittingReview(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/review/`,
        {
          rating: selectedRating,
          comment: reviewText,
          movieId: movieId,
          userId: user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setReviewText("");
      setSelectedRating(1);
      addToast("Review added successfully", "success");

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error.response?.status === 400) {
        addToast("You have already reviewed this movie", "error");
      } else {
        addToast("Failed to add review", "error");
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getInitial = () => {
    if (!user || !user.username) return "?";
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <div className="review-creator">
      <div className="review-creator-content">
        <div className="review-creator-row">
          <div className="review-creator-avatar">
            <span className="avatar-initial">{getInitial()}</span>
          </div>
          <div className="review-creator-input-wrapper">
            <input
              className="review-input"
              placeholder="Write your review here..."
              type="text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={isSubmittingReview}
            />
          </div>
          <button
            className="review-post-button"
            type="button"
            disabled={!accessToken || isSubmittingReview || !reviewText.trim()}
            onClick={handleSubmitReview}
            title="Post"
          >
            <FaPaperPlane />
          </button>
        </div>
        <div className="review-star-row">
          <ReviewStar
            value={selectedRating}
            onChange={setSelectedRating}
            disabled={isSubmittingReview}
          />
        </div>
      </div>
    </div>
  );
}
