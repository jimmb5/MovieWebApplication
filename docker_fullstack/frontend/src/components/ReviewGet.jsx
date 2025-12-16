import react from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "./ReviewGet.css";


export default function ReviewGet({ movieId }) {
  const { accessToken, user } = useAuth();
  const [reviews, setReviews] = useState([]);







  return (
    <div className="review-post">
      <div className="review-post-content">
        <h1>Reviews</h1>
        <div className="review-post-header">
          <div className="review-post-avatar"></div>
          <div className="review-creator-input-wrapper">
            <span className="avatar-initial">
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
