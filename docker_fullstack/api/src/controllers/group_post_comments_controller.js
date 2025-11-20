import {
  addOne,
  getByPostId,
  getOne,
  updateOne,
  deleteOne,
  isAuthor
} from "../models/group_post_comments_model.js";
import { getOne as getPost } from "../models/group_posts_model.js";
import { isMember } from "../models/groups_model.js";

// Luo uusi kommentti
export async function createComment(req, res, next) {
  try {
    const { groupId, postId } = req.params;
    const { comment } = req.body;
    const userId = req.user.userId;

    if (!comment) {
      return res.status(400).json({ error: "Comment is required" });
    }

    // Tarkista että käyttäjä on ryhmän jäsen
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this group to comment" });
    }

    // Tarkista että julkaisu on olemassa ja kuuluu ryhmään
    const post = await getPost(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.group_id !== groupId) {
      return res.status(404).json({ error: "Post not found in this group" });
    }

    const newComment = await addOne(postId, userId, comment.trim());

    res.status(201).json({
      message: "Comment created successfully",
      comment: newComment
    });
  } catch (err) {
    next(err);
  }
}

// Hae kaikki kommentit julkaisulle
export async function getPostComments(req, res, next) {
  try {
    const { groupId, postId } = req.params;
    const userId = req.user.userId;

    // Tarkista että käyttäjä on ryhmän jäsen
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this group to view comments" });
    }

    // Tarkista että julkaisu on olemassa ja kuuluu ryhmään
    const post = await getPost(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.group_id !== groupId) {
      return res.status(404).json({ error: "Post not found in this group" });
    }

    const comments = await getByPostId(postId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
}

// Päivitä kommentti
export async function updateComment(req, res, next) {
  try {
    const { groupId, postId, commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user.userId;

    if (!comment) {
      return res.status(400).json({ error: "Comment is required" });
    }

    // Tarkista että käyttäjä on ryhmän jäsen
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this group to update comments" });
    }

    // Tarkista että julkaisu on olemassa ja kuuluu ryhmään
    const post = await getPost(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.group_id !== groupId) {
      return res.status(404).json({ error: "Post not found in this group" });
    }

    // Tarkista että kommentti on olemassa ja kuuluu julkaisuun
    const existingComment = await getOne(commentId);
    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment.group_post_id !== postId) {
      return res.status(404).json({ error: "Comment not found in this post" });
    }

    // Vain kommentin tekijä voi päivittää
    const author = await isAuthor(commentId, userId);
    if (!author) {
      return res.status(403).json({ error: "Only the comment author can update the comment" });
    }

    const updatedComment = await updateOne(commentId, comment.trim());

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment
    });
  } catch (err) {
    next(err);
  }
}

// Poista kommentti
export async function deleteComment(req, res, next) {
  try {
    const { groupId, postId, commentId } = req.params;
    const userId = req.user.userId;

    // Tarkista että käyttäjä on ryhmän jäsen
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this group to delete comments" });
    }

    // Tarkista että julkaisu on olemassa ja kuuluu ryhmään
    const post = await getPost(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.group_id !== groupId) {
      return res.status(404).json({ error: "Post not found in this group" });
    }

    // Tarkista että kommentti on olemassa ja kuuluu julkaisuun
    const existingComment = await getOne(commentId);
    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment.group_post_id !== postId) {
      return res.status(404).json({ error: "Comment not found in this post" });
    }

    // Vain kommentin tekijä, ryhmän admin tai owner voi poistaa
    const author = await isAuthor(commentId, userId);
    if (!author && membership.role !== 'admin' && membership.role !== 'owner') {
      return res.status(403).json({ error: "Only the comment author, group admins or owners can delete the comment" });
    }

    const deletedComment = await deleteOne(commentId);

    if (!deletedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
}

