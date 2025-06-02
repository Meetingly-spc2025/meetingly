const db = require("../models/db_users");

exports.validateNicks = async ({ nickname }) => {
  const [nicknames] = await db.query("SELECT * FROM users WHERE nickname = ?", [
    nickname,
  ]);

  return nicknames;
};

exports.getTeamName = async ({ teamId }) => {
  const [teamName] = await db.query(
    "SELECT team_name FROM teams WHERE team_id =?",
    [teamId],
  );
  return teamName;
};

exports.updateNick = async ({ nickname, userId }) => {
  await db.query("UPDATE users SET nickname = ? WHERE user_id = ?", [
    nickname,
    userId,
  ]);
};

exports.leaveTeam = async ({ userId }) => {
  await db.query("UPDATE users set team_id = NULL WHERE user_id=?", [userId]);
  await db.query("DELETE FROM team_members WHERE user_id=?", [userId]);
};

exports.leaveMeetingly = async ({ userId }) => {
  await db.query("DELETE FROM users WHERE user_id=?", [userId]);
};
