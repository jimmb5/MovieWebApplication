import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import "./ReviewGet.css";

export default function ReviewGet({ movieId, refreshTrigger }) {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/review/movie/${movieId}`
      );
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchReviews();
    }
  }, [movieId, refreshTrigger]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        size={20}
        color={index < rating ? "gold" : "lightgray"}
      />
    ));
  };

  return (
    <div className="review-post">
      <div className="review-post-content">
        <h1>Reviews</h1>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="review-list">
            {reviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-header">
                  <div className="avatar-initial">
                    {review.author_username ? review.author_username.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="review-author-info">
                    <span className="review-author">{review.author_username}</span>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
