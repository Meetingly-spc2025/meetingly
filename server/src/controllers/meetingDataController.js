const db = require("../models/db_users");
const { v4: uuidv4 } = require("uuid");

// [GET] 특정 회의 상세 정보 조회
// [GET] /api/meetingData/meetingDetail/${meetingId}?teamId=${teamId}
exports.getMeetingDetail = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const [meetingResult] = await db.query(`
       SELECT
        m.meeting_id,
        m.title,
        m.creator_id,
        m.start_time,
        m.end_time,
        DATE_FORMAT(m.start_time, '%Y. %m. %d') AS date,
        TIME_FORMAT(TIMEDIFF(m.end_time, m.start_time), '%H:%i:%s') AS totalDuration,
        u.name AS host,
        GROUP_CONCAT(DISTINCT u2.name ORDER BY u2.name SEPARATOR ', ') AS members
      FROM meetings m
      JOIN users u ON m.creator_id = u.user_id
      JOIN participants p ON m.meeting_id = p.meeting_id
      JOIN users u2 ON p.user_id = u2.user_id
      WHERE m.meeting_id = ?
      GROUP BY m.meeting_id
    `, [meetingId]);

    if (meetingResult.length === 0) {
      return res.status(404).json({ error: "회의를 찾을 수 없습니다." });
    }

    const [summaries] = await db.query(`
      SELECT summary_id, status, content, created_at, room_fullname
      FROM summaries
      WHERE room_fullname = (
        SELECT room_fullname FROM meetings WHERE meeting_id = ?
      )
    `, [meetingId]);

    res.json({
      meeting: meetingResult[0],
      summaries
    });
  } catch (err) {
    console.error("회의 상세 데이터 조회 오류:", err);
    res.status(500).json({ error: "조회 실패" });
  }
};

// 회의 삭제
// [DELETE] /api/meetingData/meetingDetail/meeting/:meetingId
exports.deleteMeeting = async (req, res) => {
  const { meetingId } = req.params;
  try {
    const [[roomRow] = []] = await db.query(
      "SELECT room_fullname FROM meetings WHERE meeting_id = ?",
      [meetingId]
    );
    if (!roomRow || !roomRow.room_fullname) {
      return res.status(404).json({ error: "회의를 찾을 수 없습니다." });
    }
    const roomFullname = roomRow.room_fullname;
    const [summaryRows] = await db.query(
      "SELECT summary_id FROM summaries WHERE room_fullname = ?",
      [roomFullname]
    );
    const summaryIds = summaryRows.map((row) => row.summary_id);
    if (summaryIds.length > 0) {
      await db.query(
        `DELETE FROM tasks WHERE summary_id IN (${summaryIds.map(() => '?').join(',')})`,
        summaryIds
      );
    }
    await db.query("DELETE FROM summaries WHERE room_fullname = ?", [roomFullname]);
    await db.query("DELETE FROM participants WHERE meeting_id = ?", [meetingId]);
    await db.query("DELETE FROM meetings WHERE meeting_id = ?", [meetingId]);
    res.sendStatus(200);
  } catch (err) {
    console.error("회의 삭제 오류:", err);
    res.status(500).json({ error: "삭제 실패" });
  }
};

// 회의 제목 수정
// [PATCH] /api/meetingData/meetingDetail/meeting/:meetingId
exports.updateMeetingTitle = async (req, res) => {
  const { meetingId } = req.params;
  const { meetingName } = req.body;
  if (!meetingName) {
    return res.status(400).json({ error: "meetingName이 필요합니다." });
  }
  try {
    const [result] = await db.query(
      "UPDATE meetings SET title = ? WHERE meeting_id = ?",
      [meetingName, meetingId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "해당 회의를 찾을 수 없습니다." });
    }
    res.status(200).json({ message: "회의 제목이 성공적으로 수정되었습니다." });
  } catch (err) {
    console.error("회의 제목 수정 오류:", err);
    res.status(500).json({ error: "수정 실패" });
  }
};

// summary 수정
// [PUT] /api/meetingData/meetingDetail/summary/:summaryId
exports.updateSummaryContent = async (req, res) => {
  const { summaryId } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "content는 필수입니다." });
  }
  try {
    const [result] = await db.query(
      "UPDATE summaries SET content = ? WHERE summary_id = ?",
      [content, summaryId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "해당 요약이 존재하지 않습니다." });
    }
    res.status(200).json({ message: "요약이 성공적으로 수정되었습니다." });
  } catch (err) {
    console.error("Summary 수정 오류:", err);
    res.status(500).json({ error: "수정 실패" });
  }
};

// [GET] 팀 회의 리스트 조회
// /api/meetingData/meetinglists/:teamId
exports.getMeetingList = async (req, res) => {
  const { teamId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  try {
    const [meetings] = await db.query(
      `SELECT m.*, u.name AS host_name
       FROM meetings m
       JOIN users u ON m.creator_id = u.user_id
       WHERE m.team_id = ?
       ORDER BY m.start_time DESC
       LIMIT ?, ?`,
      [teamId, offset, limit]
    );
    res.json(meetings);
  } catch (err) {
    console.error("GET /meetinglists/:teamId 에러:", err);
    res.status(500).json({ error: "조회 실패" });
  }
};

// [GET] 특정 summary의 tasks 조회
// /api/meetingData/tasks/summary/:summary_id
exports.getTasksBySummary = async (req, res) => {
  const { summary_id } = req.params;
  try {
    const [tasks] = await db.query(
      "SELECT * FROM tasks WHERE summary_id = ? ORDER BY created_at ASC",
      [summary_id]
    );
    res.json(tasks);
  } catch (err) {
    console.error("GET /summary/:summary_id 에러:", err);
    res.status(500).json({ error: "조회 실패" });
  }
};

// [GET] 특정 meeting의 tasks 조회 (action summary_id 기준)
// /api/meetingData/tasks/meeting/:meeting_id
exports.getTasksByMeeting = async (req, res) => {
  const { meeting_id } = req.params;
  try {
    const [[room]] = await db.query("SELECT room_fullname FROM meetings WHERE meeting_id = ?", [meeting_id]);
    if (!room) return res.status(404).json({ error: "room_fullname 없음" });

    const [[summary]] = await db.query(
      "SELECT summary_id FROM summaries WHERE room_fullname = ? AND status = 'action'",
      [room.room_fullname]
    );
    if (!summary) return res.status(404).json({ error: "action summary 없음" });

    const [tasks] = await db.query(
      "SELECT * FROM tasks WHERE summary_id = ? ORDER BY created_at ASC",
      [summary.summary_id]
    );

    res.json(tasks);
  } catch (err) {
    console.error("GET /meeting/:meeting_id 에러:", err);
    res.status(500).json({ error: "조회 실패" });
  }
};

// [POST] task 추가
// /api/meetingData/tasks
exports.createTask = async (req, res) => {
  const { content, assignee_nickname, status, summary_id, team_id } = req.body;
  const task_id = uuidv4();
  let assignee_id = null;

  if (assignee_nickname) {
    const [userResult] = await db.query(
      "SELECT user_id FROM users WHERE nickname = ? AND team_id = ?",
      [assignee_nickname, team_id]
    );
    assignee_id = userResult[0]?.user_id || null;
  }

  try {
    await db.query(
      "INSERT INTO tasks (task_id, content, assignee_id, status, summary_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [task_id, content, assignee_id, status, summary_id]
    );
    res.status(201).json({ task_id });
  } catch (err) {
    console.error("POST / 에러:", err);
    res.status(500).json({ error: "추가 실패" });
  }
};

// [PUT] task 수정
// /api/meetingData/tasks/:task_id
exports.updateTask = async (req, res) => {
  const { task_id } = req.params;
  const { content, assignee_id, status } = req.body;
  const finalAssigneeId = assignee_id === "" ? null : assignee_id;

  try {
    await db.query(
      "UPDATE tasks SET content = ?, assignee_id = ?, status = ? WHERE task_id = ?",
      [content, finalAssigneeId, status, task_id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("PUT /:task_id 에러:", err);
    res.status(500).json({ error: "수정 실패" });
  }
};

// [DELETE] task 삭제
// /api/meetingData/tasks/:task_id
exports.deleteTask = async (req, res) => {
  const { task_id } = req.params;
  try {
    await db.query("DELETE FROM tasks WHERE task_id = ?", [task_id]);
    res.sendStatus(200);
  } catch (err) {
    console.error("DELETE /:task_id 에러:", err);
    res.status(500).json({ error: "삭제 실패" });
  }
};

// [GET] 팀 멤버 조회
// /api/meetingData/tasks/team/:team_id/members
exports.getTeamMembers = async (req, res) => {
  const { team_id } = req.params;
  try {
    const [members] = await db.query(
      `SELECT u.user_id, u.name, u.nickname
       FROM team_members tm
       JOIN users u ON tm.user_id = u.user_id
       WHERE tm.team_id = ?`,
      [team_id]
    );
    res.json(members);
  } catch (err) {
    console.error("GET /team/:team_id/members 에러:", err);
    res.status(500).json({ error: "팀 멤버 조회 실패" });
  }
};

// 회의 목록 (meetinglistsRouter 통합)
exports.getMeetingsByTeam = async (req, res) => {
  const { teamId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const pageSize = 6;
  const offset = (page - 1) * pageSize;
  const sortOrder = req.query.sort === "asc" ? "ASC" : "DESC";
  const searchKeyword = req.query.search || "";
  const createdByMe = req.query.createdByMe;
  const userId = req.user?.id;

  try {
    let additionalCondition = "";
    const queryParams = [teamId, `%${searchKeyword}%`];
    if (createdByMe === "me" && userId) {
      additionalCondition = "AND m.creator_id = ?";
      queryParams.push(userId);
    }
    queryParams.push(pageSize, offset);

    const [meetings] = await db.query(
      `SELECT
        m.meeting_id,
        m.title,
        DATE_FORMAT(m.start_time, '%Y. %m. %d') AS date, 
        TIME_FORMAT(TIMEDIFF(m.end_time, m.start_time), '%H:%i:%s') AS totalDuration,
        u.name AS host,
        GROUP_CONCAT(DISTINCT u2.name ORDER BY u2.name SEPARATOR ', ') AS members
      FROM meetings m
      JOIN users u ON m.creator_id = u.user_id
      JOIN participants p ON m.meeting_id = p.meeting_id
      JOIN users u2 ON p.user_id = u2.user_id
      WHERE m.team_id = ? AND m.title LIKE ?
      ${additionalCondition}
      GROUP BY m.meeting_id
      ORDER BY m.start_time ${sortOrder}
      LIMIT ? OFFSET ?`,
      queryParams
    );

    const countQueryParams = [teamId, `%${searchKeyword}%`];
    if (createdByMe === "me" && userId) countQueryParams.push(userId);
    const [totalCountResult] = await db.query(
      `SELECT COUNT(DISTINCT m.meeting_id) AS totalCount
       FROM meetings m
       JOIN users u ON m.creator_id = u.user_id
       JOIN participants p ON m.meeting_id = p.meeting_id
       JOIN users u2 ON p.user_id = u2.user_id
       WHERE m.team_id = ? AND m.title LIKE ?
       ${createdByMe === "me" && userId ? "AND m.creator_id = ?" : ""}`,
      countQueryParams
    );

    res.json({ meetings, totalDataCount: totalCountResult[0].totalCount });
  } catch (error) {
    console.error("getMeetingsByTeam 에러:", error);
    res.status(500).json({ error: "조회 실패" });
  }
};

exports.getMeetingsByDate = async (req, res) => {
  const { teamId } = req.params;
  const { date } = req.query;
  const page = parseInt(req.query.page) || 1;
  const pageSize = 6;
  const offset = (page - 1) * pageSize;

  if (!date) return res.status(400).json({ error: "날짜가 필요합니다." });

  try {
    const [meetings] = await db.query(
      `SELECT
        m.meeting_id,
        m.title,
        DATE_FORMAT(m.start_time, '%Y. %m. %d') AS date,
        u.name AS host,
        GROUP_CONCAT(DISTINCT u2.name ORDER BY u2.name SEPARATOR ', ') AS members
      FROM meetings m
      JOIN users u ON m.creator_id = u.user_id
      JOIN participants p ON m.meeting_id = p.meeting_id
      JOIN users u2 ON p.user_id = u2.user_id
      WHERE m.team_id = ? AND DATE(m.start_time) = ?
      GROUP BY m.meeting_id
      ORDER BY m.start_time DESC
      LIMIT ? OFFSET ?`,
      [teamId, date, pageSize, offset]
    );

    const [totalCountResult] = await db.query(
      `SELECT COUNT(*) AS totalCount
       FROM meetings
       WHERE team_id = ? AND DATE(start_time) = ?`,
      [teamId, date]
    );

    res.json({ meetings, totalDataCount: totalCountResult[0].totalCount });
  } catch (err) {
    console.error("getMeetingsByDate 에러:", err);
    res.status(500).json({ error: "조회 실패" });
  }
};

exports.getMeetingsByMonth = async (req, res) => {
  const { teamId } = req.params;
  const { year, month } = req.query;
  try {
    const [meetings] = await db.query(
      `SELECT
        m.meeting_id,
        m.title,
        DATE_FORMAT(m.start_time, '%Y-%m-%d') AS date,
        DATE_FORMAT(m.start_time, '%H:%i') AS startTime,
        GROUP_CONCAT(DISTINCT u2.name ORDER BY u2.name SEPARATOR ', ') AS members
      FROM meetings m
      JOIN participants p ON m.meeting_id = p.meeting_id
      JOIN users u2 ON p.user_id = u2.user_id
      WHERE m.team_id = ? AND YEAR(m.start_time) = ? AND MONTH(m.start_time) = ?
      GROUP BY m.meeting_id
      ORDER BY m.start_time ASC`,
      [teamId, year, month]
    );
    res.json({ meetings });
  } catch (err) {
    console.error("getMeetingsByMonth 에러:", err);
    res.status(500).json({ error: "조회 실패" });
  }
};
