import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";

import VideoGrid from "../../components/Room/VideoGrid";
import Controls from "../../components/Room/Controls";
import ChatBox from "../../components/Room/ChatBox";
import useWebRTC from "../../components/Room/useWebRTC";
import useSocket from "../../components/Room/useSocket";
import "../../styles/Room/MeetingRoom.css";

//전체적인 코드 흐름:: JWT재검증 -> meeting_id 불러오기 -> 소켓 연결 -> Peer미디어 준비, 회의참가 등록, join_room emit
//                 -> useSocket, useWebRTC 사용

const port = import.meta.env.VITE_SERVER_PORT;
const socket = io(`http://localhost:${port}`, { autoConnect: false });
const MAX_PARTICIPANTS = 4;

async function registerParticipant(meeting_id, user) {
  const res = await axios.post("/api/meetings/participants", { id: user.id, meeting_id });
  const data = res.data;
  return data.success;
}

const MeetingRoom = () => {
  const { roomName } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [recipientList, setRecipientList] = useState([]);
  const [recipientId, setRecipientId] = useState("all");
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  const videoRefs = useRef([]);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const [meetingId, setMeetingId] = useState(localStorage.getItem("meeting_id") || null);

  //사용자 재검증
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
          socket?.disconnect();
          navigate("/login");
          return;
        }
        setUser(response.data.user);
      } catch (err) {
        alert("로그인이 필요합니다.", err);
        navigate("/login");
      }
    })();
  }, [navigate]);

  //meeting_id가 없을 경우 roomName으로 서버에서 조회 후 localstorage에 저장
  useEffect(() => {
    if (!meetingId && roomName) {
      axios
        .get(`/api/meetings/roomName/${roomName}`)
        .then((res) => {
          const data = res.data;
          if (data.meeting_id) {
            localStorage.setItem("meeting_id", data.meeting_id);
            setMeetingId(data.meeting_id);
          } else {
            alert("유효하지 않은 회의방입니다.");
            localStorage.removeItem("meeting_id");
            navigate("/");
          }
        })
        .catch(() => {
          alert("회의방 정보를 가져올 수 없습니다.");
          navigate("/");
        });
    }
  }, [meetingId, roomName, navigate]);

  //socket.connect()로 실시간 연결을 하고, 연결이 완료되면 연결 상태/소켓 ID관리
  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("[socket connected]", socket.id);
      setSocketConnected(true);
      setSocketId(socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  const {
    myStreamRef,
    peerConnections,
    getMedia,
    createPeerConnection,
    assignStreamToSlot,
    clearSlot,
    toggleMute,
    toggleCamera,
    changeCamera,
    leaveRoom,
    muted,
    cameraOff,
    cameras,
    selectedDeviceId,
  } = useWebRTC({
    socket,
    socketId,
    nickname: user?.nickname,
    videoRefs,
  });

  useSocket({
    socket,
    socketId,
    roomName,
    nickname: user?.nickname,
    navigate,
    createPeerConnection,
    peerConnections,
    clearSlot,
    addMessage,
    assignStreamToSlot,
    getMedia,
    setRecipientList,
    setSocketConnected,
  });

  const [teamVerified, setTeamVerified] = useState(false);

  //createRoom에서 팀 검증을 하지만, 브라우저 주소창에 직접 초대링크를 입력 한 경우 팀 검증
  useEffect(() => {
    if (!user || !roomName) return;

    const fetchAndCheckTeam = async () => {
      try {
        const res1 = await axios.get(`/api/meetings/roomName/${roomName}`);
        const data1 = res1.data;
        if (!data1.meeting_id) throw new Error("유효하지 않은 회의방입니다.");
        const id = data1.meeting_id;

        const res2 = await axios.get(`/api/meetings/${id}`);
        const data2 = res2.data;
        const meetingTeamId = data2.team_id || data2.teamId;
        if (!meetingTeamId) throw new Error("회의방 팀 정보가 없습니다.");

        if (user.teamId !== meetingTeamId) {
          alert("팀이 달라서 해당 방에 입장할 수 없습니다.");
          navigate("/");
          return;
        }
        setMeetingId(id);
        setTeamVerified(true);
      } catch (err) {
        alert(err.message || "방 입장에 실패했습니다.");
        navigate("/");
      }
    };

    fetchAndCheckTeam();
  }, [user, roomName, navigate]);

  //소켓연결, 유저정보, meetingId, 팀검증이 모두 완료되면 getMedia()로 미디어 스트림을 받고, 
  //서버에 참가자 등록 api 호출을 한 뒤, join_room이벤트로 signaling을 시작한다 (signaling 로직은 useWebSocket.jsx 파일에 작성)
  useEffect(() => {
    const join = async () => {
      if (socketConnected && user?.nickname && roomName && meetingId && user?.teamId && teamVerified) {
        await getMedia();
        const success = await registerParticipant(meetingId, user);
        if (!success) {
          console.log("회의 참가 등록 실패");
          navigate("/");
          return;
        }
        // 실제 signaling 시작점
        socket.emit("join_room", { roomName, nickname: user?.nickname, meeting_id: meetingId });
      }
    };
    join();
  }, [socketConnected, user, roomName, getMedia, meetingId, navigate, teamVerified]);

  // 방 나가기 버튼 클릭 시 모든 PeerConnection 종료 및 소켓 연결 해제, meeting_id 삭제, 홈으로 이동
  const handleLeaveRoom = () => {
    leaveRoom();
    localStorage.removeItem("meeting_id");
    setTimeout(() => navigate("/"), 100);
  };

  // 채팅 메세지 전송
  const sendMessage = () => {
    const input = document.getElementById("chatMessage");
    const text = input.value.trim();
    if (!text) return;
    socket.emit("send", {
      myNick: user?.nickname,
      dm: recipientId,
      msg: text,
    });
    input.value = "";
  };

  if (!user) return null;

  return (
    <div className="meeting-room">
      <div className="video-section">
        <VideoGrid videoRefs={videoRefs} MAX_PARTICIPANTS={MAX_PARTICIPANTS} />
        <div className="controls">
          <Controls
            muted={muted}
            cameraOff={cameraOff}
            cameras={cameras}
            selectedDeviceId={selectedDeviceId}
            toggleMute={toggleMute}
            toggleCamera={toggleCamera}
            changeCamera={(e) => changeCamera(e.target.value)}
            handleLeaveRoom={handleLeaveRoom}
            myStream={myStreamRef.current}
            roomId={roomName}
          />
        </div>
      </div>

      <div className="chat-section">
        <div className="chat-header">Chat</div>
        <ChatBox
          messages={messages}
          recipientList={recipientList}
          recipientId={recipientId}
          setRecipientId={setRecipientId}
          nickname={user.nickname}
          sendMessage={sendMessage}
          socketId={socketId}
        />
      </div>
    </div>
  );
};

export default MeetingRoom;
