const mypageModel = require("../models/mypageModel");

// [GET] /api/mypage/check-nickname
exports.validateNickname = async (req, res) => {
  const { nickname } = req.query;

  try {
    console.log(`바꿀 닉네임 : ${nickname}`);
    const [nicknames] = await mypageModel.validateNicks({ nickname });
    if (nicknames !== undefined) {
      return res.json({ available: false });
    }

    res.json({ available: true });
  } catch (err) {
    console.error("닉네임 중복 확인 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// [GET] /api/mypage/team-data
exports.getTeamInfo = async (req, res) => {
  const { teamId } = req.query;
  if (!teamId) {
    return res.status(400).json({ error: "teamId가 전달되지 않았습니다." });
  }

  const [teamName] = await mypageModel.getTeamName({ teamId });
  if (teamName === undefined) {
    res.json({ teamName: null });
  } else {
    res.json({ teamName: teamName.team_name });
  }
};

// [PUT] /api/mypage/update-nickname
exports.updateNickname = async (req, res) => {
  const { userInfo, nickname } = req.body;
  const userId = userInfo.userId;
  console.log("userInfo :: ", userInfo);

  try {
    await mypageModel.updateNick({ nickname, userId });
    res.json({ success: true });
  } catch (err) {
    console.error("닉네임 저장 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// [POST] /api/mypage/leave-team
exports.leaveTeam = async (req, res) => {
  const { userInfo } = req.body;
  const userId = userInfo.userId;

  try {
    await mypageModel.leaveTeam({ userId });
    res.json({ success: true });
  } catch (err) {
    console.error("팀 탈퇴 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// [POST] /api/mypage/leave-meetingly
exports.leaveMeetingly = async (req, res) => {
  const { userInfo } = req.body;
  const userId = userInfo.userId;

  try {
    await mypageModel.leaveMeetingly({ userId });
    res.json({ success: true });
  } catch (err) {
    console.error("미팅리 탈퇴 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};
