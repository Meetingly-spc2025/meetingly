const meetingModel = require("../models/meetingModel");

exports.createMeeting = async (req, res) => {
  const { title, teamMember_id, room_fullname } = req.body;
  const start_time = new Date();

  try {
    const meeting_id = await meetingModel.createMeeting({ title, room_fullname, start_time, teamMember_id });
    res.json({ meeting_id });
  } catch (err) {
    res.status(500).json({ error: "회의 생성 실패", details: err.message });
  }
};

exports.endMeeting = async (req, res) => {
  const { meeting_id } = req.body;
  const end_time = new Date();

  try {
    await meetingModel.endMeeting(meeting_id, end_time);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "회의 종료 실패", details: err.message });
  }
};

exports.getMeeting = async (req, res) => {
  const { meeting_id } = req.params;
  try {
    const meeting = await meetingModel.getMeeting(meeting_id);
    if (meeting) res.json(meeting);
    else res.status(404).json({ error: "회의를 찾을 수 없음" });
  } catch (err) {
    res.status(500).json({ error: "회의 조회 실패", details: err.message });
  }
};

exports.addParticipant = async (req, res) => {
  const { user_name, meeting_id } = req.body;
  try {
    console.log("참가자 등록 요청:", { user_name, meeting_id });
    await meetingModel.addParticipant({
      user_name,
      teamMember_id: "tm1",
      meeting_id,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("참가자 등록 에러:", err);
    res.status(500).json({ error: "참가자 등록 실패", details: err.message });
  }
};

exports.getMeetingIdByRoomName = async (req, res) => {
  const { roomName } = req.params;
  try {
    const meeting = await meetingModel.getMeetingByRoomName(roomName);
    if (meeting) {
      res.json({ meeting_id: meeting.meeting_id });
    } else {
      res.status(404).json({ error: "회의방을 찾을 수 없습니다." });
    }
  } catch (err) {
    res.status(500).json({ error: "DB 조회 실패", details: err.message });
  }
};