import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaPaperPlane, FaTrash, FaEdit } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useGroup } from "../../contexts/GroupContext";
import DropdownMenu from "../modals/DropdownMenu";
import ConfirmationModal from "../modals/ConfirmationModal";
import "./GroupPost.css";

function GroupPost({ post }) {
  const { groupId } = useParams();
  const { accessToken, user } = useAuth();
  const { addToast } = useToast();
  const { getCurrentUserRole, fetchPosts } = useGroup();
  const [movieDetails, setMovieDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostDescription, setEditPostDescription] = useState("");
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

  useEffect(() => {

    fetchMovieDetails();
    fetchComments();
  }, [post.movie_tmdb_id]);


  const fetchMovieDetails = async () => {
    if (!post.movie_tmdb_id) {
      setMovieDetails(null);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/movie/${post.movie_tmdb_id}`
      );
      setMovieDetails(response.data);
    } catch (error) {
      console.error(`Error fetching movie ${post.movie_tmdb_id}:`, error);
      setMovieDetails(null);
    }
  };

  const fetchComments = async () => {
    if (!accessToken || !groupId) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/posts/${post.id}/comments`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment || !accessToken || !groupId) return;

    setIsSubmittingComment(true);
    try {
       await axios.post(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/posts/${post.id}/comment`,
        { comment: commentText.trim() },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      setCommentText("");
      await fetchComments();
      addToast("Comment added", "success");
    } catch (error) {
      console.error("Error creating comment:", error);
      addToast("Failed to add comment", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!accessToken || !groupId) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/posts/${post.id}/comment/${commentId}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      await fetchComments();
      addToast("Comment deleted", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      addToast("Failed to delete comment", "error");
    }
  };

  const canDeleteComment = (comment) => {
    if (!user) return false;
    const userRole = getCurrentUserRole();
    // Käyttäjä voi poistaa omat kommenttinsa
    if (comment.author_id === user.id) {
        return true;
    }
    // Admin ja owner voi poistaa kaikkien kommentit
    if (userRole === 'admin' || userRole === 'owner') {
        return true;
    }
    return false;
  };

  const canEditComment = (comment) => {
    if (!user) return false;
    // Vain kommentin tekijä voi muokata
    return comment.author_id === user.id;
  };

  const canEditPost = () => {
    if (!user) return false;
    // Vain postauksen tekijä voi muokata
    return post.author_id === user.id;
  };

  const canDeletePost = () => {
    if (!user) return false;
    const userRole = getCurrentUserRole();
    // Käyttäjä voi poistaa omat postauksensa
    if (post.author_id === user.id) return true;
    // Admin ja owner voi poistaa kaikki postaukset
    if (userRole === 'admin' || userRole === 'owner') return true;
    return false;
  };

  const handleEditPost = () => {
    setIsEditingPost(true);
    setEditPostDescription(post.description || "");
  };

  const handleCancelEditPost = () => {
    setIsEditingPost(false);
    setEditPostDescription("");
  };

  const handleSavePost = async () => {
    if (!accessToken || !groupId) return;

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/posts/${post.id}`,
        {
          description: editPostDescription.trim() || null,
          movie_tmdb_id: post.movie_tmdb_id || null
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      setIsEditingPost(false);
      setEditPostDescription("");
      addToast("Post updated", "success");
      await fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      addToast("Failed to update post", "error");
    }
  };

  const handleDeletePost = () => {
    setShowDeletePostModal(true);
  };

  const confirmDeletePost = async () => {
    if (!accessToken || !groupId) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/posts/${post.id}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      addToast("Post deleted", "success");
      await fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      addToast("Failed to delete post", "error");
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.comment);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editCommentText.trim() || !accessToken || !groupId) return;

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/groups/${groupId}/posts/${post.id}/comment/${commentId}`,
        { comment: editCommentText.trim() },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      
      setEditingCommentId(null);
      setEditCommentText("");
      await fetchComments();
      addToast("Comment updated", "success");
    } catch (error) {
      console.error("Error updating comment:", error);
      addToast("Failed to update comment", "error");
    }
  };


  const getInitial = (username) => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="group-post">
      <div className="group-post-content">
        <div className="group-post-header">
          <div className="group-post-avatar">
            <span className="avatar-initial">{getInitial(post.author_username)}</span>
          </div>
          <div className="group-post-author-info">
            <span className="group-post-username">{post.author_username}</span>
            <span className="group-post-date">{formatDate(post.created_at)}</span>
          </div>
          {(canEditPost() || canDeletePost()) && (
            <div className="group-post-menu">
              <DropdownMenu
                items={[
                  ...(canEditPost() ? [{
                    id: 'edit',
                    label: 'Edit',
                    icon: <FaEdit />,
                    onClick: handleEditPost
                  }] : []),
                  ...(canDeletePost() ? [{
                    id: 'delete',
                    label: 'Delete',
                    icon: <FaTrash />,
                    onClick: handleDeletePost,
                    danger: true
                  }] : [])
                ]}
              />
            </div>
          )}
        </div>
        
        {isEditingPost ? (
          <div className="group-post-edit">
            <textarea
              className="group-post-edit-input"
              value={editPostDescription}
              onChange={(e) => setEditPostDescription(e.target.value)}
              placeholder="Write something..."
              rows={3}
            />
            <div className="group-post-edit-actions">
              <button
                type="button"
                className="group-post-save"
                onClick={handleSavePost}
              >
                Save
              </button>
              <button
                type="button"
                className="group-post-cancel"
                onClick={handleCancelEditPost}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          post.description && (
            <p className="group-post-description">{post.description}</p>
          )
        )}

        {movieDetails && (
          <div className="group-post-movie">
            <div className="group-post-movie-poster-wrapper">
              {movieDetails.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w154${movieDetails.poster_path}`}
                  alt={movieDetails.title}
                  className="group-post-movie-poster"
                />
              ) : (
                <div className="group-post-movie-poster-placeholder">
                  <span>No Image</span>
                </div>
              )}
            </div>
            <div className="group-post-movie-info">
              <h4 className="group-post-movie-title">{movieDetails.title}</h4>
              {movieDetails.release_date && (
                <p className="group-post-movie-year">
                  {new Date(movieDetails.release_date).getFullYear()}
                </p>
              )}
              {movieDetails.overview ? (
                <div className="group-post-movie-overview">
                  <p>
                    {isOverviewExpanded || movieDetails.overview.length <= 150
                      ? movieDetails.overview
                      : (
                        <>
                          {movieDetails.overview.slice(0, 150)}
                          <button
                            type="button"
                            className="group-post-movie-overview-toggle"
                            onClick={() => setIsOverviewExpanded(true)}
                          >
                            ...
                          </button>
                        </>
                      )}
                  </p>
                  {isOverviewExpanded && movieDetails.overview.length > 150 && (
                    <button
                      type="button"
                      className="group-post-movie-overview-toggle"
                      onClick={() => setIsOverviewExpanded(false)}
                    >
                      Show less
                    </button>
                  )}
                </div>
              ) : (
                <p className="group-post-movie-overview">No overview available</p>
              )}
            </div>
          </div>
        )}

        <div className="group-post-comments-section">
          <button
            className="group-post-comments-toggle"
            onClick={() => setShowComments(!showComments)}
            type="button"
          >
            {showComments ? "Hide" : "Show"} Comments ({comments.length})
          </button>

          {showComments && (
            <div className="group-post-comments">
              <form onSubmit={handleSubmitComment} className="group-post-comment-form">
                <input
                  type="text"
                  className="group-post-comment-input"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  className="group-post-comment-submit"
                  disabled={!commentText.trim() || isSubmittingComment}
                  title="Post comment"
                >
                  <FaPaperPlane />
                </button>
              </form>

              <div className="group-post-comments-list">
                {comments.length > 0 ? (
                  comments.map((comment) => {
                    const isEditing = editingCommentId === comment.id;
                    const canEdit = canEditComment(comment);
                    const canDelete = canDeleteComment(comment);
                    const showMenu = canEdit || canDelete;

                    return (
                      <div key={comment.id} className="group-post-comment">
                        <div className="group-post-comment-avatar">
                          <span className="avatar-initial">{getInitial(comment.author_username)}</span>
                        </div>
                        <div className="group-post-comment-content">
                          <div className="group-post-comment-header">
                            <span className="group-post-comment-author">{comment.author_username}</span>
                            <span className="group-post-comment-date">
                              {formatDate(comment.created_at)}
                            </span>
                            {showMenu && (
                              <div className="group-post-comment-menu">
                                <DropdownMenu
                                  items={[
                                    ...(canEdit ? [{
                                      id: 'edit',
                                      label: 'Edit',
                                      icon: <FaEdit />,
                                      onClick: () => handleEditComment(comment)
                                    }] : []),
                                    ...(canDelete ? [{
                                      id: 'delete',
                                      label: 'Delete',
                                      icon: <FaTrash />,
                                      onClick: () => handleDeleteComment(comment.id),
                                      danger: true
                                    }] : [])
                                  ]}
                                />
                              </div>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="group-post-comment-edit">
                              <input
                                type="text"
                                className="group-post-comment-edit-input"
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                autoFocus
                              />
                              <div className="group-post-comment-edit-actions">
                                <button
                                  type="button"
                                  className="group-post-comment-save"
                                  onClick={() => handleSaveEdit(comment.id)}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="group-post-comment-cancel"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="group-post-comment-text">{comment.comment}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="group-post-no-comments">No comments yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeletePostModal}
        onClose={() => setShowDeletePostModal(false)}
        onConfirm={confirmDeletePost}
        title="Delete Post?"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="delete"
      />
    </div>
  );
}

export default GroupPost;

