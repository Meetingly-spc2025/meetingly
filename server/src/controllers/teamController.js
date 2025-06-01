const teamModel = require("../models/teamModel");

// [GET] /api/teams/:teamId/members
exports.teamList = async (req, res) => {
  const { teamId } = req.params;
  try {
    const [members] = await teamModel.getTeamMemberList({ teamId });
    const [teamInfo] = await teamModel.getTeamInfo({ teamId });
    const { team_name: teamName, team_url: teamUrl } = teamInfo;

    res.status(200).json({ teamName, teamUrl, members });
  } catch (error) {
    console.error(error);
    res.status(500).send("멤버 목록 조회 실패");
  }
};

// [POST] /api/teams/create
exports.createTeam = async (req, res) => {
  const { teamName, description, userId, teamUrl } = req.body;
  const teamId = uuidv4();

  try {
    // 1. 팀 URL 중복 체크
    const [existing] = await teamModel.validateTeamURL({ teamUrl });
    if (existing.length > 0) {
      return res.status(409).json({ message: "초대 코드 중복" });
    }
    // 2. 팀 생성
    await teamModel.createTeam({
      teamId,
      teamName,
      description,
      teamUrl,
      userId,
    });
    // 3. 사용자(users)에 팀 ID 지정
    await teamModel.addUserTeam({ teamId, userId });
    // 4. team_members 테이블에 관리자 등록
    await teamModel.grantAdmin({ teamId, userId });

    res.status(201).json({ teamId, teamUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 에러");
  }
};

// [POST] /api/teams/join
exports.joinTeam = async (req, res) => {
  const { teamUrl, userId } = req.body;

  try {
    const [existing] = await teamModel.validateTeamURL({ teamUrl });
    if (existing.length === 0) {
      return res.status(404).send("초대 링크가 유효하지 않습니다");
    }

    const teamId = existing[0].team_id;

    await teamModel.addUserTeam({ teamId, userId });
    await teamModel.grantMember({ teamId, userId });

    res.status(200).send("팀 가입 완료");
  } catch (err) {
    console.error(err);
    res.status(500).send("팀 가입 실패");
  }
};
