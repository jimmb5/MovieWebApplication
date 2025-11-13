import pool from "../database.js";

// Luo uusi ryhmä
export async function addOne(name, description, createdBy) {
  const result = await pool.query(
    "INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING id, name, description, created_by, created_at",
    [name, description, createdBy]
  );
  return result.rows[0];
}

// Hae kaikki ryhmät
export async function getAll() {
  const result = await pool.query(
    "SELECT id, name, description FROM groups ORDER BY created_at DESC"
  );
  return result.rows;
}

// Hae ryhmä ID:n perusteella 
export async function getOne(groupId) {
  const result = await pool.query(
    `SELECT g.id, g.name, g.description, g.created_by, g.created_at, 
     u.username as creator_username,
     COUNT(gm.user_id)::int as member_count
     FROM groups g 
     LEFT JOIN users u ON g.created_by = u.id 
     LEFT JOIN group_members gm ON g.id = gm.group_id 
     WHERE g.id = $1 
     GROUP BY g.id, g.name, g.description, g.created_by, g.created_at, u.username`,
    [groupId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Hae käyttäjän ryhmät
export async function getByUserId(userId) {
  const result = await pool.query(
    `SELECT g.id, g.name, g.description, g.created_by, g.created_at, u.username as creator_username, 
     gm.role, gm.joined_at 
     FROM groups g 
     LEFT JOIN users u ON g.created_by = u.id 
     LEFT JOIN group_members gm ON g.id = gm.group_id 
     WHERE gm.user_id = $1 
     ORDER BY g.created_at DESC`,
    [userId]
  );
  return result.rows;
}

// Päivitä ryhmän tiedot
export async function updateOne(groupId, name, description) {
  const result = await pool.query(
    "UPDATE groups SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description, created_by, created_at",
    [name, description, groupId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Poista ryhmä
export async function deleteOne(groupId) {
  const result = await pool.query(
    "DELETE FROM groups WHERE id = $1 RETURNING id, name, description, created_by",
    [groupId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Lisää jäsen ryhmään
export async function addMember(groupId, userId, role = 'member') {
  const result = await pool.query(
    "INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3) RETURNING user_id, group_id, role, joined_at",
    [groupId, userId, role]
  );
  return result.rows[0];
}

// Poista jäsen ryhmästä
export async function removeMember(groupId, userId) {
  const result = await pool.query(
    "DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING user_id, group_id",
    [groupId, userId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Hae ryhmän jäsenet
export async function getMembers(groupId) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.email, gm.role, gm.joined_at 
     FROM group_members gm 
     JOIN users u ON gm.user_id = u.id 
     WHERE gm.group_id = $1 
     ORDER BY gm.joined_at ASC`,
    [groupId]
  );
  return result.rows;
}

// Tarkista onko käyttäjä ryhmän jäsen
export async function isMember(groupId, userId) {
  const result = await pool.query(
    "SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2",
    [groupId, userId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Päivitä jäsenen rooli
export async function updateMemberRole(groupId, userId, newRole) {
  const result = await pool.query(
    "UPDATE group_members SET role = $1 WHERE group_id = $2 AND user_id = $3 RETURNING user_id, group_id, role",
    [newRole, groupId, userId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Luo join request
export async function createJoinRequest(groupId, userId) {
  const result = await pool.query(
    "INSERT INTO group_join_requests (group_id, user_id, status) VALUES ($1, $2, 'pending') RETURNING id, group_id, user_id, status, created_at",
    [groupId, userId]
  );
  return result.rows[0];
}

// Hae join request
export async function getJoinRequest(groupId, userId) {
  const result = await pool.query(
    "SELECT id, group_id, user_id, status, created_at FROM group_join_requests WHERE group_id = $1 AND user_id = $2",
    [groupId, userId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Hae kaikki ryhmän join requestit 
export async function getGroupJoinRequests(groupId) {
  const result = await pool.query(
    `SELECT gjr.id, gjr.group_id, gjr.user_id, gjr.status, gjr.created_at,
            u.username, u.email
     FROM group_join_requests gjr
     JOIN users u ON gjr.user_id = u.id
     WHERE gjr.group_id = $1 AND gjr.status = 'pending'
     ORDER BY gjr.created_at DESC`,
    [groupId]
  );
  return result.rows;
}

// Hae käyttäjän join requestit
export async function getUserJoinRequests(userId) {
  const result = await pool.query(
    `SELECT gjr.id, gjr.group_id, gjr.user_id, gjr.status, gjr.created_at,
            g.name as group_name, g.description as group_description
     FROM group_join_requests gjr
     JOIN groups g ON gjr.group_id = g.id
     WHERE gjr.user_id = $1 AND gjr.status = 'pending'
     ORDER BY gjr.created_at DESC`,
    [userId]
  );
  return result.rows;
}

// Poista join request
export async function deleteJoinRequest(requestId) {
  const result = await pool.query(
    "DELETE FROM group_join_requests WHERE id = $1 RETURNING id, group_id, user_id",
    [requestId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

