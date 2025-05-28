const db = require("./db_users");

exports.createMeeting = async ({ title, room_fullname, start_time, creator_name, teamId }) => {
  const [result] = await db.query(
    "INSERT INTO meetings (title, room_fullname, start_time, creator_name, team_id) VALUES (?, ?, ?, ?, ?)",
    [title, room_fullname, start_time, creator_name, teamId]
  );
  return result.insertId;
};

exports.endMeeting = async (meeting_id, end_time) => {
  await db.query(
    "UPDATE meetings SET end_time = ? WHERE meeting_id = ?",
    [end_time, meeting_id]
  );
};

exports.getMeeting = async (meeting_id) => {
  const [rows] = await db.query(
    "SELECT * FROM meetings WHERE meeting_id = ?",
    [meeting_id]
  );
  return rows[0];
};

exports.addParticipant = async ({ user_name, teamId, meeting_id }) => {
  await db.query(
    "INSERT INTO participants (user_name, team_id, meeting_id) VALUES (?, ?, ?)",
    [user_name, teamId, meeting_id]
  );
};

exports.getMeetingByRoomName = async (roomName) => {
  const [rows] = await db.query(
    "SELECT meeting_id FROM meetings WHERE room_fullname = ?",
    [roomName]
  );
  return rows[0];
};
