const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../models/db_users");

router.post("/create", async (req, res) => {
  console.log("팀 생성 시작");
  const { teamName, description, userId, teamUrl } = req.body;
  const teamId = uuidv4();

  console.log("팀 아이디 :: ", teamId);

  try {
    // 1. 팀 URL 중복 체크
    const [existing] = await db.query(
      "SELECT team_id FROM teams WHERE team_url = ?",
      [teamUrl],
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "초대 코드 중복" });
    }

    // 2. 팀 생성
    await db.query(
      `INSERT INTO teams (team_id, team_name, description, team_url, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [teamId, teamName, description, teamUrl, userId],
    );

    // 3. 사용자(users)에 팀 ID 지정
    await db.query("UPDATE users SET team_id = ? WHERE user_id = ?", [
      teamId,
      userId,
    ]);

    // 4. team_members 테이블에 관리자 등록
    await db.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES (?, ?, 'admin')`,
      [teamId, userId],
    );

    console.log("팀 생성 완료");
    res.status(201).json({ teamId, teamUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 에러");
  }
});

router.post("/join", async (req, res) => {
  const { teamUrl, userId } = req.body;

  try {
    console.log("팀 참여 시작");

    // 1. 초대 코드(teamUrl)로 팀 조회
    const [rows] = await db.query(
      "SELECT team_id FROM teams WHERE team_url = ?",
      [teamUrl],
    );

    if (rows.length === 0) {
      return res.status(404).send("초대 링크가 유효하지 않습니다");
    }

    const teamId = rows[0].team_id;

    // 2. users 테이블에서 사용자 team_id 설정
    await db.query("UPDATE users SET team_id = ? WHERE user_id = ?", [
      teamId,
      userId,
    ]);

    // 3. team_members 테이블에 멤버 등록
    await db.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES (?, ?, 'member')`,
      [teamId, userId],
    );

    res.status(200).send("팀 가입 완료");
  } catch (err) {
    console.error(err);
    res.status(500).send("팀 가입 실패");
  }
});

router.get("/:teamId/members", async (req, res) => {
  const { teamId } = req.params;
  try {
    const [members] = await db.query(
      `SELECT 
         u.user_id, u.name, u.email, u.nickname, tm.role
       FROM team_members tm
       JOIN users u ON tm.user_id = u.user_id
       WHERE tm.team_id = ?`,
      [teamId],
    );

    console.log("팀 아이디 :: ", teamId);

    const [[teamInfo]] = await db.query(
      "SELECT team_name, team_url FROM teams WHERE team_id=?",
      [teamId],
    );

    const { team_name: teamName, team_url: teamUrl } = teamInfo;

    res.status(200).json({ teamName, teamUrl, members });
  } catch (error) {
    console.error(error);
    res.status(500).send("멤버 목록 조회 실패");
  }
});

module.exports = router;
