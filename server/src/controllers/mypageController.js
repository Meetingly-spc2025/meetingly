const mypageModel = require("../models/mypageModel");

// [GET] /api/mypage/check-nickname
exports.validateNickname = async (req, res) => {
  const { nickname } = req.query;

  try {
    console.log(`바꿀 닉네임 : ${nickname}`);
    const [nicknames] = await mypageModel.validateNicks({ nickname });
    if (nicknames.length > 0) {
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
  // const { userId } = req.body;
  const { userId, teamId } = req.body;

  try {
    // 현재 users에서 teamId가 teamId를 Null로 바뀌는 것만 수행중.. teams table에서도 delete 하는 sql문 필요
    await mypageModel.leaveTeam({ userId });
    res.json({ success: true });
  } catch (err) {
    console.error("팀 탈퇴 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};
