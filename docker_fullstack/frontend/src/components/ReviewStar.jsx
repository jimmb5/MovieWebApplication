import { useState } from 'react';
import { FaStar } from 'react-icons/fa';



function ReviewStar({ value, onChange, disabled = false }) {
  return (
    <div>
      <p>Select star rating:</p>

      {[1, 2, 3, 4, 5].map((star) => (
        <label key={star} style={{ cursor: disabled ? "default" : "pointer" }}>
          <input
            type="radio"
            name="star"
            value={star}
            checked={value === star}
            onChange={() => onChange(star)}
            disabled={disabled}
            style={{ display: "none" }}
          />

          <FaStar
            size={24}
            color={star <= value ? "gold" : "lightgray"}
          />
        </label>
      ))}
    </div>
  );
}

export default ReviewStar;



