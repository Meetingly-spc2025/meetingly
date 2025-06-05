const db = require("./meetingly_db");

exports.createMeeting = async ({
  title,
  room_fullname,
  start_time,
  creator_id,
  teamId,
}) => {
  const [result] = await db.query(
    "INSERT INTO meetings (title, room_fullname, start_time, creator_id, team_id) VALUES (?, ?, ?, ?, ?)",
    [title, room_fullname, start_time, creator_id, teamId],
  );
  return result.insertId;
};

exports.endMeeting = async (meeting_id, end_time) => {
  await db.query("UPDATE meetings SET end_time = ? WHERE meeting_id = ?", [
    end_time,
    meeting_id,
  ]);
};

exports.getMeeting = async (meeting_id) => {
  const [rows] = await db.query("SELECT * FROM meetings WHERE meeting_id = ?", [
    meeting_id,
  ]);
  return rows[0];
};

exports.addParticipant = async ({ meeting_id, id }) => {
  await db.query(
    "INSERT INTO participants (meeting_id, user_id) VALUES (?, ?)",
    [meeting_id, id],
  );
};

exports.getMeetingByRoomName = async (roomName) => {
  const [rows] = await db.query(
    "SELECT meeting_id FROM meetings WHERE room_fullname = ?",
    [roomName],
  );
  return rows[0];
};

exports.findMeetingById = async (meetingId) => {
  const [rows] = await db.query(
    "SELECT * FROM meetings WHERE meeting_id = ? LIMIT 1",
    [meetingId],
  );
  return rows.length > 0 ? rows[0] : null;
};

exports.getTeamIdByMeetingId = async (meeting_id) => {
  const [rows] = await db.query(
    "SELECT team_id FROM meetings WHERE meeting_id = ?",
    [meeting_id],
  );
  return rows.length > 0 ? rows[0].team_id : null;
};

exports.getTeamIdByUserId = async (user_id) => {
  const [rows] = await db.query("SELECT team_id FROM users WHERE user_id = ?", [
    user_id,
  ]);
  return rows.length > 0 ? rows[0].team_id : null;
};

exports.isAlreadyParticipant = async (meeting_id, user_id) => {
  const [rows] = await db.query(
    "SELECT 1 FROM participants WHERE meeting_id = ? AND user_id = ?",
    [meeting_id, user_id],
  );
  return rows.length > 0;
};
