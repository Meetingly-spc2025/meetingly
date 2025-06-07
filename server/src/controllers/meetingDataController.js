const { finished } = require("combined-stream");
const db = require("../models/meetingly_db");
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

// ISOString → MySQL용 DATETIME 포맷 변환 함수 
function formatDateToMySQL(datetime) {
  const d = new Date(datetime);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// [POST] task 추가
// /api/meetingData/tasks
exports.createTask = async (req, res) => {
  const { content, assignee_id, status, summary_id, team_id, created_at, finished_at } = req.body;
  const task_id = uuidv4();

  const formattedCreatedAt = created_at ? formatDateToMySQL(created_at) : formatDateToMySQL(new Date());
  const formattedFinishedAt = finished_at ? formatDateToMySQL(finished_at) : formatDateToMySQL(new Date());

  try {
    await db.query(
      "INSERT INTO tasks (task_id, content, assignee_id, status, summary_id, created_at, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [task_id, content, assignee_id || null, status, summary_id, formattedCreatedAt, formattedFinishedAt]
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
  const { content, assignee_id, status, created_at, finished_at } = req.body;
  const finalAssigneeId = assignee_id === "" ? null : assignee_id;
  const formattedCreatedAt = created_at ? formatDateToMySQL(created_at) : formatDateToMySQL(new Date());
  const formattedFinishedAt = finished_at ? formatDateToMySQL(finished_at) : formatDateToMySQL(new Date());

  try {
    await db.query(
      "UPDATE tasks SET content = ?, assignee_id = ?, status = ?, created_at = ?, finished_at = ? WHERE task_id = ?",
      [content, finalAssigneeId, status, formattedCreatedAt, formattedFinishedAt, task_id]
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

// 사용자의 할 일을 월별로 조회
// [GET] /api/meetingData/tasks/by-user/:userId/by-month?year=YYYY&month=MM
exports.getUserTasksByMonth = async (req, res) => {
  const { userId } = req.params;
  const { year, month } = req.query;

  if (!userId || !year || !month) {
    return res.status(400).json({ error: "userId, year, month는 필수입니다." });
  }

  try {
    const [tasks] = await db.query(
      `SELECT 
        t.task_id,
        t.content,
        t.status,
        DATE_FORMAT(t.created_at, '%Y-%m-%d') AS created_at,
        DATE_FORMAT(t.finished_at, '%Y-%m-%d') AS finished_at,
        t.summary_id,
        m.meeting_id
      FROM tasks t
      JOIN summaries s ON t.summary_id = s.summary_id
      JOIN meetings m ON s.room_fullname = m.room_fullname
      WHERE t.assignee_id = ?
        AND YEAR(t.created_at) = ?
        AND MONTH(t.created_at) = ?
      ORDER BY t.created_at ASC`,
      [userId, year, month]
    );

    res.json({ tasks });
  } catch (err) {
    console.error("getUserTasksByMonth 에러:", err);
    res.status(500).json({ error: "할 일 조회 실패" });
  }
};

// 팀 멤버 회의 참여 비율 조회
// [GET] api/meetingData/participation/:teamId
exports.getParticipationStats = async (req, res) => {
  const { teamId } = req.params;

  try {
    // 1. 팀 멤버 전체 조회
    const [members] = await db.query(
      `SELECT u.user_id, u.name 
       FROM team_members tm 
       JOIN users u ON tm.user_id = u.user_id 
       WHERE tm.team_id = ?`,
      [teamId]
    );

    // 2. 참여자 정보 조회
    const [participations] = await db.query(
      `SELECT p.user_id, COUNT(*) AS count 
       FROM participants p
       JOIN meetings m ON p.meeting_id = m.meeting_id
       WHERE m.team_id = ?
       GROUP BY p.user_id`,
      [teamId]
    );

    // 3. 참여수 매핑
    const participationMap = {};
    participations.forEach((p) => {
      participationMap[p.user_id] = p.count;
    });

    const result = members.map((member) => ({
      name: member.name,
      count: participationMap[member.user_id] || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("참여율 조회 실패:", err);
    res.status(500).json({ error: "데이터 조회 실패" });
  }
};

// 주간 회의 횟수 조회
// [GET] api/meetingData/weekly/:teamId
exports.getWeeklyMeetingStats = async (req, res) => {
  const { teamId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT DAYOFWEEK(start_time) AS weekday, COUNT(*) AS count
       FROM meetings
       WHERE team_id = ? AND start_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DAYOFWEEK(start_time)`,
      [teamId]
    );

    // MySQL의 DAYOFWEEK: 일(1)~토(7) => JS 기준으로 월(0)~일(6) 맞춤 변환
    const counts = Array(7).fill(0); // 월~일
    rows.forEach(({ weekday, count }) => {
      const jsWeekday = (weekday + 5) % 7; // 일(1) → 6, 월(2) → 0 ...
      counts[jsWeekday] = count;
    });

    res.json({
      labels: ["월", "화", "수", "목", "금", "토", "일"],
      data: counts,
    });
  } catch (err) {
    console.error("주간 회의 통계 조회 오류:", err);
    res.status(500).json({ error: "회의 통계 조회 실패" });
  }
};

// summary_id로부터 meeting_id 조회
exports.getMeetingInfoBySummaryId = async (req, res) => {
  const { summaryId } = req.params;

  try {
    const [[result]] = await db.query(
      `SELECT m.meeting_id, m.team_id
       FROM summaries s
       JOIN meetings m ON s.room_fullname = m.room_fullname
       WHERE s.summary_id = ?`,
      [summaryId]
    );

    if (!result) {
      return res.status(404).json({ error: "해당 summary에 연결된 meeting 정보를 찾을 수 없습니다." });
    }

    res.status(200).json({ meetingId: result.meeting_id, teamId: result.team_id });
  } catch (err) {
    console.error("Meeting 정보 조회 실패:", err);
    res.status(500).json({ error: "서버 오류로 meeting 정보를 조회할 수 없습니다." });
  }
};
