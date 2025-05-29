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
  const [dmTargets, setDmTargets] = useState([]);
  const [dmTargetId, setDmTargetId] = useState("all");
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  const videoRefs = useRef([]);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const [meetingId, setMeetingId] = useState(localStorage.getItem("meeting_id") || null);

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
        setUser(response.data.user);
      } catch (err) {
        alert("로그인이 필요합니다.", err);
        navigate("/login");
      }
    })();
  }, [navigate]);

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
            navigate("/");
          }
        })
        .catch(() => {
          alert("회의방 정보를 가져올 수 없습니다.");
          navigate("/");
        });
    }
  }, [meetingId, roomName, navigate]);

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
    setDmTargets,
    setSocketConnected,
  });

  const [teamVerified, setTeamVerified] = useState(false);

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
        socket.emit("join_room", { roomName, nickname: user?.nickname, meeting_id: meetingId });
      }
    };
    join();
  }, [socketConnected, user, roomName, getMedia, meetingId, navigate, teamVerified]);

  const handleLeaveRoom = () => {
    leaveRoom();
    localStorage.removeItem("meeting_id");
    setTimeout(() => navigate("/"), 100);
  };

  const sendMessage = () => {
    const input = document.getElementById("chatMessage");
    const text = input.value.trim();
    if (!text) return;
    socket.emit("send", {
      myNick: user?.nickname,
      dm: dmTargetId,
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
          dmTargets={dmTargets}
          dmTargetId={dmTargetId}
          setDmTargetId={setDmTargetId}
          nickname={user.nickname}
          sendMessage={sendMessage}
          socketId={socketId}
        />
      </div>
    </div>
  );
};

export default MeetingRoom;
