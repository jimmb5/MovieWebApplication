import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";

export default function StarRating({ movieId, size = 28, showInfo }) {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!movieId) return;

    axios
      .get(`${process.env.REACT_APP_API_URL}/review/movie/${movieId}/rating`)
      .then((res) => {
        setAverage(res.data?.average_rating || 0);
        setCount(res.data?.rating_count || 0);
      })
      .catch(() => {
        setAverage(0);
        setCount(0);
      });
  }, [movieId]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={size}
          color={star <= Math.round(average) ? "gold" : "rgba(255,255,255,0.3)"}
        />
      ))}
      {showInfo && count > 0 && (
        <span style={{ fontSize: 14, opacity: 0.8 }}>
          {average} / 5 ({count})
        </span>
      )}
    </div>
  );
}
