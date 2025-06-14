const db = require("./meetingly_db");

exports.getTeamMemberList = async ({ teamId }) => {
  const [members] = await db.query(
    `SELECT 
      u.user_id, u.name, u.email, u.nickname, u.user_image, tm.role
      FROM team_members tm
      JOIN users u ON tm.user_id = u.user_id
      WHERE tm.team_id = ?`,
    [teamId],
  );
  return members;
};

exports.getTeamInfo = async ({ teamId }) => {
  const [[teamInfo]] = await db.query(
    "SELECT team_name, team_url FROM teams WHERE team_id=?",
    [teamId],
  );
  return [teamInfo];
};

exports.validateTeamURL = async ({ teamUrl }) => {
  const [existing] = await db.query("SELECT team_id FROM teams WHERE team_url = ?", [
    teamUrl,
  ]);
  return existing;
};

exports.createTeam = async ({ teamId, teamName, description, teamUrl, userId }) => {
  await db.query(
    `INSERT INTO teams (team_id, team_name, description, team_url, user_id)
       VALUES (?, ?, ?, ?, ?)`,
    [teamId, teamName, description, teamUrl, userId],
  );
};

exports.addUserTeam = async ({ teamId, userId }) => {
  await db.query("UPDATE users SET team_id = ? WHERE user_id = ?", [teamId, userId]);
};

exports.grantAdmin = async ({ teamId, userId }) => {
  await db.query(
    `INSERT INTO team_members (team_id, user_id, role)
       VALUES (?, ?, 'admin')`,
    [teamId, userId],
  );
};

exports.grantMember = async ({ teamId, userId }) => {
  await db.query(
    `INSERT INTO team_members (team_id, user_id, role)
       VALUES (?, ?, 'member')`,
    [teamId, userId],
  );
};

exports.kickoutMember = async ({ teamId, userId }) => {
  await db.query(`DELETE FROM team_members WHERE team_id = ? AND user_id = ?`, [
    teamId,
    userId,
  ]);
  await db.query("UPDATE users SET team_id = NULL WHERE user_id=?", [userId]);
};

exports.updateTeamName = async ({ name, teamId }) => {
  await db.query(`UPDATE teams SET team_name = ? WHERE team_id = ?`, [name, teamId]);
};

exports.deleteTeam = async ({ teamId }) => {
  await db.query(`DELETE FROM team_members WHERE team_id = ?`, [teamId]);
  await db.query(`DELETE FROM teams WHERE team_id = ?`, [teamId]);
};
