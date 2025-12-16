import React from 'react';
import { FaStar } from 'react-icons/fa';
import './ReviewStar.css';

function ReviewStar({ value, onChange, disabled = false }) {
  return (
    <div className="review-star-selector">
      <p className="review-star-label">Select star rating:</p>
      <div className="review-star-options">
        {[1, 2, 3, 4, 5].map((star) => (
          <label 
            key={star} 
            className={`review-star-option ${disabled ? 'disabled' : ''}`}
          >
            <input
              type="radio"
              name="star"
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              disabled={disabled}
              className="review-star-input"
            />
            <FaStar
              size={24}
              color={star <= value ? "gold" : "rgba(255, 255, 255, 0.3)"}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export default ReviewStar;
