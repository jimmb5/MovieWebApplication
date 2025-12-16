import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaStar, FaEdit, FaTrash, FaCheck, FaTimes, FaEllipsisV } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import ConfirmationModal from "./modals/ConfirmationModal";
import "./ReviewGet.css";

export default function ReviewGet({ movieId, refreshTrigger }) {
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [editedRating, setEditedRating] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const { user, accessToken } = useAuth();
  const { addToast } = useToast();

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

  // Sulje dropdown kun klikataan muualle
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.review-actions')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        size={20}
        color={index < rating ? "gold" : "lightgray"}
      />
    ));
  };

  const renderEditableStars = (currentRating, onRatingChange) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        size={20}
        color={index < currentRating ? "gold" : "lightgray"}
        onClick={() => onRatingChange(index + 1)}
        style={{ cursor: "pointer" }}
      />
    ));
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review.review_id);
    setEditedComment(review.comment);
    setEditedRating(review.rating);
    setOpenDropdownId(null);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditedComment("");
    setEditedRating(1);
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/review/${reviewId}`,
        {
          rating: editedRating,
          comment: editedComment,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      addToast("Review updated successfully", "success");
      setEditingReviewId(null);
      fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      addToast("Failed to update review", "error");
    }
  };

  const handleDeleteClick = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteModal(true);
    setOpenDropdownId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/review/${reviewToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      addToast("Review deleted successfully", "success");
      fetchReviews();
      setReviewToDelete(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      addToast("Failed to delete review", "error");
    }
  };

  const toggleDropdown = (reviewId) => {
    setOpenDropdownId(openDropdownId === reviewId ? null : reviewId);
  };

  return (
    <>
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
                    
                    {user && user.id === review.user_id && (
                      <div className="review-actions">
                        <button
                          className="review-menu-button"
                          onClick={() => toggleDropdown(review.review_id)}
                        >
                          <FaEllipsisV />
                        </button>
                        {openDropdownId === review.review_id && (
                          <div className="review-dropdown-menu">
                            <button
                              onClick={() => handleEditClick(review)}
                              className="dropdown-item"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(review.review_id)}
                              className="dropdown-item delete"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editingReviewId === review.review_id ? (
                    <div className="review-edit-mode">
                      <div className="review-rating">
                        {renderEditableStars(editedRating, setEditedRating)}
                      </div>
                      <textarea
                        className="review-edit-textarea"
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        rows={3}
                      />
                      <div className="review-edit-actions">
                        <button
                          className="review-save-button"
                          onClick={() => handleSaveEdit(review.review_id)}
                        >
                          <FaCheck /> Save
                        </button>
                        <button
                          className="review-cancel-button"
                          onClick={handleCancelEdit}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Review?"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="delete"
      />
    </>
  );
}
