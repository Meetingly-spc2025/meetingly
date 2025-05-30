const db = require("../models/db_users");

// [GET] /api/mypage/check-nickname
exports.validateNickname = async (req, res) => {
  const { nickname } = req.query;

  try {
    console.log(`바꿀 닉네임 : ${nickname}`);
    const [rows] = await db.query("SELECT * FROM users WHERE nickname = ?", [
      nickname,
    ]);
    if (rows.length > 0) {
      return res.json({ available: false });
    }
    res.json({ available: true });
  } catch (err) {
    console.error("닉네임 중복 확인 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// [PUT] /api/mypage/update-nickname
exports.updateNickname = async (req, res) => {
  const { userInfo, nickname } = req.body;
  console.log("userInfo :: ", userInfo);
  const userId = userInfo.userId;

  try {
    await db.query("UPDATE users SET nickname = ? WHERE user_id = ?", [
      nickname,
      userId,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error("닉네임 저장 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// [POST] /api/mypage/leave-team
exports.leaveTeam = async (req, res) => {
  const { userId } = req.body;

  try {
    await db.query("UPDATE users SET teamId = NULL WHERE id = ?", [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error("팀 탈퇴 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};
