import { Router } from "express";
import {
  getGroups,
  getGroup,
  getUserGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  removeGroupMember,
  updateGroupMemberRole,
  leaveGroup,
  approveJoinRequest,
  createGroupJoinRequest,
  getGroupJoinRequestsList,
  getUserJoinRequestsList,
  rejectJoinRequest,
  cancelJoinRequest
} from "../controllers/groups_controller.js";
import {
  createPost,
  getGroupPosts,
  getPost,
  updatePost,
  deletePost
} from "../controllers/group_posts_controller.js";
import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment
} from "../controllers/group_post_comments_controller.js";
import { authenticateToken } from "../middleware/auth.js";

const groupsRouter = Router();

// Julkiset reitit
groupsRouter.get("/", getGroups);

// Suojatut reitit (vaativat autentikoinnin)
groupsRouter.get("/:groupId", authenticateToken, getGroup);
groupsRouter.post("/create", authenticateToken, addGroup);
groupsRouter.put("/:groupId", authenticateToken, updateGroup); // Testaamatta postmanilla
groupsRouter.delete("/:groupId", authenticateToken, deleteGroup);

groupsRouter.get("/user/join-requests", authenticateToken, getUserJoinRequestsList);
groupsRouter.get("/user/:userId", authenticateToken, getUserGroups);

// Ryhmän jäsenet
groupsRouter.get("/:groupId/members", authenticateToken, getGroupMembers);
groupsRouter.post("/:groupId/leave", authenticateToken, leaveGroup);
groupsRouter.delete("/:groupId/members/:userId", authenticateToken, removeGroupMember);
groupsRouter.put("/:groupId/members/:userId/role", authenticateToken, updateGroupMemberRole);

// Join requestit
groupsRouter.post("/:groupId/join-request", authenticateToken, createGroupJoinRequest);
groupsRouter.get("/:groupId/join-requests", authenticateToken, getGroupJoinRequestsList);
groupsRouter.post("/:groupId/join-requests/:requestId/approve", authenticateToken, approveJoinRequest);
groupsRouter.post("/:groupId/join-requests/:requestId/reject", authenticateToken, rejectJoinRequest);
groupsRouter.delete("/:groupId/join-requests/:requestId", authenticateToken, cancelJoinRequest);

// Ryhmän julkaisut
groupsRouter.post("/:groupId/create-post", authenticateToken, createPost);
groupsRouter.get("/:groupId/posts", authenticateToken, getGroupPosts);
groupsRouter.get("/:groupId/posts/:postId", authenticateToken, getPost); // Testaamatta postmanilla
groupsRouter.put("/:groupId/posts/:postId", authenticateToken, updatePost);
groupsRouter.delete("/:groupId/posts/:postId", authenticateToken, deletePost);

// Julkaisun kommentit
groupsRouter.post("/:groupId/posts/:postId/comment", authenticateToken, createComment);
groupsRouter.get("/:groupId/posts/:postId/comments", authenticateToken, getPostComments);
groupsRouter.put("/:groupId/posts/:postId/comment/:commentId", authenticateToken, updateComment);
groupsRouter.delete("/:groupId/posts/:postId/comment/:commentId", authenticateToken, deleteComment);

export default groupsRouter;

