"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RoomForm, JoinByLink } from "../../components/Room/MeetingFormComponents";
import axios from "axios";
import "../../styles/Room/CreateMeeting.css";

// 전체적인 코드 흐름:: JWT인증 -> 회의 생성 폼 -> 서버로 회의 생성 요청
//                              초대링크/입장 -> 초대링크로 입장 시 팀 ID 검증

const CreateMeeting = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [roomTitle, setRoomTitle] = useState("");
  const [roomSubject, setRoomSubject] = useState("");
  const [roomDate, setRoomDate] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [hasMeetingBeenCreated, setHasMeetingBeenCreated] = useState(false); // 새로운 상태 추가
  const [createdRoomName, setCreatedRoomName] = useState("");
  const [showEnterRoomBtn, setShowEnterRoomBtn] = useState(false);

  // 페이지 진입 시 사용자 인증 확인 (JWT 토큰 검사)
  // 인증 성공 시 회의 생성 폼 노출, 미인증시 로그인 페이지로 이동
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const response = await axios.get("/api/users/jwtauth", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data || !response.data.user) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }
        if (!response.data.user.teamId) {
          navigate("/team/join");
        }
        setUser(response.data.user);
      } catch (err) {
        alert("로그인이 필요합니다.", err);
        navigate("/login");
      }
    })();

    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setRoomDate(formatted);
  }, [navigate]);

  const joinLinkRef = useRef();

  // uuid로 고유한 회의방을 생성하고, 서버에 방 생성 요청 -> 성공 시 초대 링크 표시
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!roomTitle || !roomSubject || !roomDate) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    const uuid = crypto.randomUUID();
    const roomName = `${roomTitle}__${uuid}`;
    const link = `${window.location.origin}/room/${roomName}`;
    const title = roomName.substring(0, roomName.lastIndexOf("__"));

    let meeting_id;
    try {
      const res = await axios.post("/api/meetings", {
        title,
        room_fullname: roomName,
        creator_id: user.id,
        teamId: user.teamId,
      });
      const data = res.data;
      if (res.status === 200 && data.meeting_id) {
        meeting_id = data.meeting_id;
      } else {
        throw new Error(data.error || "회의 생성 실패");
      }
    } catch (err) {
      console.log("회의방 생성 실패: " + err.message);
      return;
    }

    setInviteLink(link);
    setHasMeetingBeenCreated(true); // 회의 생성 완료 시 상태 업데이트
    setCreatedRoomName(roomName);
    setShowEnterRoomBtn(true);

    localStorage.setItem("meeting_id", meeting_id);
  };

  const handleEnterRoom = () => {
    if (!createdRoomName) {
      alert("회의방 정보가 없습니다.");
      return;
    }
    navigate(`/room/${createdRoomName}`);
  };

  // 초대링크 복사: 클립보드 API 활용
  const copyLink = () => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => alert("초대 링크가 복사되었습니다!"))
      .catch((err) => {
        console.error("복사 실패:", err);
        alert("복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
      });
  };

  // 초대링크로 입장 시 팀 ID검증
  const joinByLink = async () => {
    // 링크의 roomName추출
    const input = joinLinkRef.current.value.trim();
    if (!input || !input.startsWith("http")) {
      alert("유효한 초대 링크를 입력하세요.");
      return;
    }
    const relativePath = input.replace(window.location.origin, "");
    const match = relativePath.match(/\/room\/(.+)$/);
    if (!match) {
      alert("유효한 초대 링크를 입력하세요.");
      return;
    }
    const roomName = match[1]; // /room/:roomName 패턴에서 roomName 추출

    // 방 정보 조회
    try {
      // 1. meeting_id 기준 조회
      const res1 = await axios.get(`/api/meetings/roomName/${roomName}`);
      if (res1.status !== 200) throw new Error("방 정보를 불러올 수 없습니다.");
      const data1 = res1.data;
      const meetingId = data1.meeting_id;
      if (!meetingId) {
        alert("회의방 정보를 찾을 수 없습니다.");
        return;
      }

      // 2. team_id 기준 조회
      const res2 = await axios.get(`/api/meetings/${meetingId}`);
      if (res2.status !== 200) throw new Error("방 정보를 불러올 수 없습니다.");
      const data2 = res2.data;
      const meetingTeamId = data2.team_id || data2.teamId;

      if (!meetingTeamId) {
        alert("회의방 team_id를 찾을 수 없습니다.");
        return;
      }
      if (!user || !user.teamId) {
        alert("로그인 정보를 확인할 수 없습니다.");
        return;
      }
      if (user.teamId !== meetingTeamId) {
        alert("팀이 달라서 해당 방에 입장할 수 없습니다.");
        return;
      }
      navigate(relativePath);
    } catch (err) {
      alert(err.message || "방 입장에 실패했습니다.");
    }
  };

  return (
    <div className="create-room">
      <div className="create-room-box">
        <h1>화상 회의 생성</h1>

        {user && ( // user 정보가 있을 때만 폼 렌더링
          <>
            <RoomForm
              roomTitle={roomTitle}
              setRoomTitle={setRoomTitle}
              roomSubject={roomSubject}
              setRoomSubject={setRoomSubject}
              roomDate={roomDate}
              inviteLink={inviteLink}
              showInviteLink={hasMeetingBeenCreated} // showInviteLink 대신 hasMeetingBeenCreated 사용
              showEnterRoomBtn={showEnterRoomBtn}
              onCreateRoom={handleRoomSubmit}
              onCopyLink={copyLink}
              onEnterRoom={handleEnterRoom}
              isMeetingCreated={hasMeetingBeenCreated} // 새로운 prop 전달
            />
            <JoinByLink onJoin={joinByLink} joinLinkRef={joinLinkRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default CreateMeeting;
