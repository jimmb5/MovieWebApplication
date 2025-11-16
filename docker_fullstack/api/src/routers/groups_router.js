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
import { authenticateToken } from "../middleware/auth.js";

const groupsRouter = Router();

// Julkiset reitit
groupsRouter.get("/", getGroups);

// Suojatut reitit (vaativat autentikoinnin)
groupsRouter.get("/:groupId", authenticateToken, getGroup);
groupsRouter.post("/create", authenticateToken, addGroup);
groupsRouter.put("/:groupId", authenticateToken, updateGroup); // Testaamatta postmanilla
groupsRouter.delete("/:groupId", deleteGroup);

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

export default groupsRouter;

