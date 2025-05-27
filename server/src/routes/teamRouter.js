const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../models/db_users");

router.post("/create", async (req, res) => {
  console.log("팀 생성 시작");
  const { teamName, description, userId, teamUrl } = req.body;
  const teamId = uuidv4();
  const teamMemberId = uuidv4();

  console.log("팀 아이디 :: ", teamId);

  try {
    // 팀 코드 중복 확인
    const [existing] = await db.query(
      "SELECT team_id FROM teams WHERE team_url = ?",
      [teamUrl],
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "초대 코드 중복" });
    }

    // 팀 생성
    await db.query(
      "INSERT INTO teams (team_id, name, description, team_url) VALUES (?, ?, ?, ?)",
      [teamId, teamName, description, teamUrl],
    );

    // 사용자에게 팀 할당
    await db.query("UPDATE users SET team_id = ? WHERE user_id = ?", [
      teamId,
      userId,
    ]);

    // 팀 관리자 등록
    await db.query(
      `
      INSERT INTO teamMembers (teamMember_id, role, user_id, team_id, joined_at)
      VALUES (?, 'admin', ?, ?, NOW())
    `,
      [teamMemberId, userId, teamId],
    );

    console.log("팀 생성 완료 보냄..~");
    res.status(201).json({ teamId, teamUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 에러");
  }
});

router.post("/join", async (req, res) => {
  const { teamUrl, userId } = req.body;
  const teamMemberId = uuidv4();

  try {
    const [rows] = await db.query(
      "SELECT team_id FROM teams WHERE team_url = ?",
      [teamUrl],
    );

    if (rows.length === 0) {
      return res.status(404).send("초대 링크가 유효하지 않습니다");
    }

    const teamId = rows[0].team_id;

    // 이미 가입된 경우 체크 (옵션)
    const [exists] = await db.query(
      "SELECT * FROM teamMembers WHERE team_id = ? AND user_id = ?",
      [teamId, userId],
    );
    if (exists.length > 0) {
      return res.status(409).send("이미 가입된 팀입니다");
    }

    // 팀에 멤버로 추가
    await db.query(
      "INSERT INTO teamMembers (teamMember_id, role, joined_at, user_id, team_id) VALUES (?, ?, NOW(), ?, ?)",
      [teamMemberId, "member", userId, teamId],
    );

    res.status(200).send("팀 가입 완료");
  } catch (err) {
    console.error(err);
    res.status(500).send("팀 가입 실패");
  }
});

module.exports = router;
