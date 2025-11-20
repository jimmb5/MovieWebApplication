import {
  addOne,
  getByGroupId,
  getOne,
  updateOne,
  deleteOne,
  isAuthor
} from "../models/group_posts_model.js";
import { isMember } from "../models/groups_model.js";

// Luo uusi julkaisu
export async function createPost(req, res, next) {
  try {
    const { groupId } = req.params;
    const { movie_tmdb_id, description } = req.body;
    const userId = req.user.userId;

    // Tarkista että käyttäjä on ryhmän jäsen
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this group to create posts" });
    }

    // pitää olla joko kuvaus tai elokuva
    if (!description && !movie_tmdb_id) {
      return res.status(400).json({ error: "Can't create empty post" });
    }

    const post = await addOne(groupId, userId, movie_tmdb_id, description);

    res.status(201).json({
      message: "Post created successfully",
      post: post
    });
  } catch (err) {
    next(err);
  }
}

// Hae kaikki ryhmän julkaisut
export async function getGroupPosts(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    // Tarkista että käyttäjä on ryhmän jäsen
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this group to view posts" });
    }

    const posts = await getByGroupId(groupId);
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

// Hae yksi julkaisu
export async function getPost(req, res, next) {
  try {
    const { groupId, postId } = req.params;
    const userId = req.user.userId;

    // Tarkista että käyttäjä on ryhmän jäsen
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this group to view posts" });
    }

    const post = await getOne(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Tarkista että julkaisu kuuluu ryhmään
    if (post.group_id !== groupId) {
      return res.status(404).json({ error: "Post not found in this group" });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
}

// Päivitä julkaisu
export async function updatePost(req, res, next) {
  try {
    const { groupId, postId } = req.params;
    const { description, movie_tmdb_id } = req.body;
    const userId = req.user.userId;

    // Tarkista että käyttäjä on ryhmän jäsen
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this group to update posts" });
    }

    // Tarkista että julkaisu on olemassa ja kuuluu ryhmään
    const existingPost = await getOne(postId);
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.group_id !== groupId) {
      return res.status(404).json({ error: "Post not found in this group" });
    }

    // Vain omistaja voi päivittää
    const author = await isAuthor(postId, userId);
    if (!author) {
      return res.status(403).json({ error: "Only the post author can update the post" });
    }

    // Vähintään joko kuvaus tai elokuva täytyy olla
    if (!description && !movie_tmdb_id) {
      return res.status(400).json({ error: "Can't update post to be empty" });
    }

    const post = await updateOne(postId, description, movie_tmdb_id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({
      message: "Post updated successfully",
      post: post
    });
  } catch (err) {
    next(err);
  }
}

// Poista julkaisu
export async function deletePost(req, res, next) {
  try {
    const { groupId, postId } = req.params;
    const userId = req.user.userId;

    // Tarkista että käyttäjä on ryhmän jäsen
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this group to delete posts" });
    }

    // Tarkista että julkaisu on olemassa ja kuuluu ryhmään
    const existingPost = await getOne(postId);
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.group_id !== groupId) {
      return res.status(404).json({ error: "Post not found in this group" });
    }

    // Vain postauksen tekijä, ryhmän admin tai owner voi poistaa
    const author = await isAuthor(postId, userId);
    if (!author && membership.role !== 'admin' && membership.role !== 'owner') {
      return res.status(403).json({ error: "Only the post author, group admins or owners can delete the post" });
    }

    const post = await deleteOne(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
}

