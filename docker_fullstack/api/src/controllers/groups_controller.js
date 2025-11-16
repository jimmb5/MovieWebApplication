import {
  getAll,
  addOne,
  getOne,
  getByUserId,
  updateOne,
  deleteOne,
  addMember,
  removeMember,
  getMembers,
  isMember,
  updateMemberRole,
  createJoinRequest,
  getJoinRequest,
  getGroupJoinRequests,
  getUserJoinRequests,
  deleteJoinRequest
} from "../models/groups_model.js";

// Hae kaikki ryhmät
export async function getGroups(req, res, next) {
  try {
    const groups = await getAll();
    res.json(groups);
  } catch (err) {
    next(err);
  }
}

// Hae yksi ryhmä ID:n perusteella
export async function getGroup(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;
    
    // vain jäsenet voivat nähdä ryhmän tiedot
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(403).json({ error: "You must be a member of this group to view it" });
    }
    
    const group = await getOne(groupId);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    res.json(group);
  } catch (err) {
    next(err);
  }
}

// Hae käyttäjän ryhmät
export async function getUserGroups(req, res, next) {
  try {
    const { userId } = req.params;
    const groups = await getByUserId(userId);
    res.json(groups);
  } catch (err) {
    next(err);
  }
}

// Luo uusi ryhmä
export async function addGroup(req, res, next) {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId; // authenticateToken middleware asettaa req.user.userId eikä req.user.id

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const group = await addOne(name, description, userId);
    // Lisää luoja automaattisesti ryhmään owner-roolilla
    await addMember(group.id, userId, 'owner');
    
    res.status(201).json({
      message: "Group created successfully",
      group: group
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Group name already exists" });
    }
    next(err);
  }
}

// Päivitä ryhmän tiedot (vain owner tai admin) , normi käyttäjille pitää tehdä oma endpoint vähemillä oikeuksilla
export async function updateGroup(req, res, next) {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Tarkista että käyttäjä on ryhmän owner tai admin
    const membership = await isMember(groupId, userId);
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({ error: "Only group owners and admins can update group details" });
    }

    const group = await updateOne(groupId, name, description);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json({
      message: "Group updated successfully",
      group: group
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Group name already exists" });
    }
    next(err);
  }
}

// Poista ryhmä
export async function deleteGroup(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    // vain owner voi poistaa ryhmän
    const membership = await isMember(groupId, userId);
    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: "Only group owner can delete the group" });
    }

    const group = await deleteOne(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json({ message: `Group ${group.name} with id ${group.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
}

// Hae ryhmän jäsenet
export async function getGroupMembers(req, res, next) {
  try {
    const { groupId } = req.params;
    const members = await getMembers(groupId);
    res.json(members);
  } catch (err) {
    next(err);
  }
}

// Hyväksy join request ja lisää jäsen ryhmään
export async function approveJoinRequest(req, res, next) {
  try {
    const { groupId, requestId } = req.params;
    const currentUserId = req.user.userId;

    // Tarkista että käyttäjä on ryhmän owner tai admin
    const membership = await isMember(groupId, currentUserId);
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({ error: "Only group owners and admins can approve join requests" });
    }

    // Hae join request 
    const allRequests = await getGroupJoinRequests(groupId);
    const request = allRequests.find(r => r.id === requestId);

    if (!request) {
      return res.status(404).json({ error: "Join request not found" });
    }

    // Tarkista että käyttäjä ei ole jo jäsen
    const existingMember = await isMember(groupId, request.user_id);
    if (existingMember) {
      // Poista request koska käyttäjä on jo jäsen
      await deleteJoinRequest(requestId);
      return res.status(409).json({ error: "User is already a member of this group" });
    }

    // Lisää käyttäjä ryhmään
    const member = await addMember(groupId, request.user_id, 'member');
    
    // Poista request koska se on nyt käsitelty
    await deleteJoinRequest(requestId);

    res.status(201).json({
      message: "Join request approved and member added successfully",
      member: member
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "User is already a member of this group" });
    }
    next(err);
  }
}

// Poista jäsen ryhmästä
export async function removeGroupMember(req, res, next) {
  try {
    const { groupId, userId } = req.params;
    const currentUserId = req.user.userId;

    // vain owner tai admin voi poistaa jäsenen
    const membership = await isMember(groupId, currentUserId);
    if (currentUserId !== userId && (!membership || (membership.role !== 'owner' && membership.role !== 'admin'))) {
      return res.status(403).json({ error: "Only group owners and admins can remove members" });
    }

    // estä itsensä poistaminen
    const targetMember = await isMember(groupId, userId);
    if (targetMember && targetMember.role === 'owner' || targetMember.role === 'admin' && currentUserId === userId) {
      return res.status(403).json({ error: "Group owner or admin cannot remove themselves." });
    }

    const member = await removeMember(groupId, userId);

    if (!member) {
      return res.status(404).json({ error: "Member not found in this group" });
    }

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    next(err);
  }
}

// Päivitä jäsenen rooli
export async function updateGroupMemberRole(req, res, next) {
  try {
    const { groupId, userId } = req.params;
    const { newRole } = req.body;
    const currentUserId = req.user.userId;

    if (!newRole || !['member', 'admin', 'owner'].includes(newRole)) {
      return res.status(400).json({ error: "Valid role (member, admin, owner) is required" });
    }

    // Tarkista että käyttäjä on ryhmän owner
    const membership = await isMember(groupId, currentUserId);
    if (!membership || membership.role !== 'owner') {
      return res.status(403).json({ error: "Only group owner can change member roles" });
    }

    // estä owneria muuttamasta itsensä roolia
    if (currentUserId === userId) {
      return res.status(403).json({ error: "Owner cannot change their own role. Transfer ownership to another member to become a member." });
    }

    // Tarkista että kohde on ryhmän jäsen
    const targetMember = await isMember(groupId, userId);
    if (!targetMember) {
      return res.status(404).json({ error: "Member not found in this group" });
    }

    // Jos siirretään ownership toiselle
    if (newRole === 'owner' && userId !== currentUserId) {
      // Päivitä kohde owneriksi
      await updateMemberRole(groupId, userId, 'owner');
      // Päivitä nykyinen owner memberiksi
      await updateMemberRole(groupId, currentUserId, 'member');
      
      return res.json({
        message: "Ownership transferred successfully",
        newOwner: { user_id: userId, role: 'owner' },
        previousOwner: { user_id: currentUserId, role: 'member' }
      });
    }

    // normaali roolin muutos 
    const member = await updateMemberRole(groupId, userId, newRole);

    if (!member) {
      return res.status(404).json({ error: "Member not found in this group" });
    }

    res.json({
      message: "Member role updated successfully",
      member: member
    });
  } catch (err) {
    next(err);
  }
}

// Lähde ryhmästä
export async function leaveGroup(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    // vain jäsenet voi lähteä ryhmästä (ei ulkopuoliset, jotka ei ole edes ryhmässä)
    const membership = await isMember(groupId, userId);
    if (!membership) {
      return res.status(404).json({ error: "You are not a member of this group" });
    }

    // estä owneria lähtemästä
    if (membership.role === 'owner') {
      return res.status(403).json({ error: "Group owner cannot leave the group. Transfer ownership first or delete the group." });
    }

    const member = await removeMember(groupId, userId);

    if (!member) {
      return res.status(404).json({ error: "Member not found in this group" });
    }

    res.json({ message: "You have successfully left the group" });
  } catch (err) {
    next(err);
  }
}



// Tee join request
export async function createGroupJoinRequest(req, res, next) {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    // Tarkista että käyttäjä ei ole jo jäsen
    const existingMember = await isMember(groupId, userId);
    if (existingMember) {
      return res.status(409).json({ error: "You are already a member of this group" });
    }

    // Tarkista että käyttäjällä ei ole jo pending request
    const existingRequest = await getJoinRequest(groupId, userId);
    if (existingRequest && existingRequest.status === 'pending') {
      return res.status(409).json({ error: "You already have a pending join request for this group" });
    }

    const request = await createJoinRequest(groupId, userId);

    res.status(201).json({
      message: "Join request created successfully",
      request: request
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Join request already exists" });
    }
    next(err);
  }
}

// Hae ryhmän join requestit
export async function getGroupJoinRequestsList(req, res, next) {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.userId;

    // vain owner tai admin voi nähdä join requestit
    const membership = await isMember(groupId, currentUserId);
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({ error: "Only group owners and admins can view join requests" });
    }

    const requests = await getGroupJoinRequests(groupId);
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

// Hae käyttäjän join requestit
export async function getUserJoinRequestsList(req, res, next) {
  try {
    const userId = req.user.userId;

    const requests = await getUserJoinRequests(userId);
    res.json(requests);
  } catch (err) {
    next(err);
  }
}

// Hylkää join request
export async function rejectJoinRequest(req, res, next) {
  try {
    const { groupId, requestId } = req.params;
    const currentUserId = req.user.userId;

    // vain owner tai admin voi hylätä join requestin
    const membership = await isMember(groupId, currentUserId);
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return res.status(403).json({ error: "Only group owners and admins can reject join requests" });
    }

    // Hae join request
    const allRequests = await getGroupJoinRequests(groupId);
    const request = allRequests.find(r => r.id === requestId);

    if (!request) {
      return res.status(404).json({ error: "Join request not found" });
    }

    // Poista request koska se on hylätty
    const deletedRequest = await deleteJoinRequest(requestId);

    res.json({
      message: "Join request rejected and removed",
      request: deletedRequest
    });
  } catch (err) {
    next(err);
  }
}

// Peruuta oma join request
export async function cancelJoinRequest(req, res, next) {
  try {
    const { groupId, requestId } = req.params;
    const userId = req.user.userId;

    // Hae join request
    const allRequests = await getUserJoinRequests(userId);
    const request = allRequests.find(r => r.id === requestId && r.group_id === groupId);

    if (!request) {
      return res.status(404).json({ error: "Join request not found" });
    }

    // requestin täytyy olla pending
    if (request.status !== 'pending') {
      return res.status(400).json({ error: "Cannot cancel a request that has already been processed" });
    }

    // Poista request
    const deletedRequest = await deleteJoinRequest(requestId);

    res.json({
      message: "Join request cancelled",
      request: deletedRequest
    });
  } catch (err) {
    next(err);
  }
}

