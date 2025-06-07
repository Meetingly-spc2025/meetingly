const db = require("./meetingly_db");

exports.validateNicks = async ({ nickname }) => {
  const [nicknames] = await db.query("SELECT * FROM users WHERE nickname = ?", [
    nickname,
  ]);

  return nicknames;
};

exports.getTeamName = async ({ teamId }) => {
  const [teamName] = await db.query("SELECT team_name FROM teams WHERE team_id =?", [
    teamId,
  ]);
  return teamName;
};

exports.updateNick = async ({ nickname, userId }) => {
  await db.query("UPDATE users SET nickname = ? WHERE user_id = ?", [nickname, userId]);
};

exports.leaveTeam = async ({ userId }) => {
  await db.query("UPDATE users SET team_id = NULL WHERE user_id=?", [userId]);
  await db.query("DELETE FROM team_members WHERE user_id=?", [userId]);
};

exports.leaveMeetingly = async ({ userId }) => {
  await db.query("UPDATE users SET is_deleted = true WHERE user_id=?", [userId]);
};

exports.updateProfile = async ({ userId, user_image }) => {
  await db.query("UPDATE users SET user_image = ? WHERE user_id = ?", [
    user_image,
    userId,
  ]);
};
