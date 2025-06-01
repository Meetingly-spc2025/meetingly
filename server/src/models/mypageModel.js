const db = require("../models/db_users");

exports.validateNicks = async ({ nickname }) => {
  const [nicknames] = await db.query("SELECT * FROM users WHERE nickname = ?", [
    nickname,
  ]);

  return nicknames;
};

exports.updateNick = async ({ nickname, userId }) => {
  await db.query("UPDATE users SET nickname = ? WHERE user_id = ?", [
    nickname,
    userId,
  ]);
};

exports.leaveTeam = async ({ userId }) => {
  await db.query("UPDATE users SET teamId = NULL WHERE id = ?", [userId]);
};
