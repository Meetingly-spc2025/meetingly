import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import VideoGrid from "../components/Room/VideoGrid";
import Controls from "../components/Room/Controls";
import ChatBox from "../components/Room/ChatBox";
import useWebRTC from "../components/Room/useWebRTC";
import useSocket from "../components/Room/useSocket";
import "../styles/MeetingRoom.css";

const port = import.meta.env.VITE_SERVER_PORT;
const socket = io(`http://localhost:${port}`, { autoConnect: false });
const MAX_PARTICIPANTS = 4;

const MeetingRoom = () => {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const nickname = localStorage.getItem("nickname");

  const [messages, setMessages] = useState([]);
  const [dmTargets, setDmTargets] = useState([]);
  const [dmTargetId, setDmTargetId] = useState("all");
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);

  const videoRefs = useRef([]);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

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
    nickname,
    videoRefs,
  });

  useSocket({
    socket,
    socketId,
    roomName,
    nickname,
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

  useEffect(() => {
    const join = async () => {
      if (socketConnected && nickname && roomName) {
        await getMedia();
        socket.emit("join_room", { roomName, nickname });
      }
    };
    join();
  }, [socketConnected, nickname, roomName, getMedia]);

  const handleLeaveRoom = () => {
    leaveRoom();
    setTimeout(() => navigate("/"), 100);
  };

  const sendMessage = () => {
    const input = document.getElementById("chatMessage");
    const text = input.value.trim();
    if (!text) return;
    socket.emit("send", {
      myNick: nickname,
      dm: dmTargetId,
      msg: text,
    });
    input.value = "";
  };

  return (
    <div className="meeting-room">
      <div className="video-section">
        <div className="video-grid">
          <VideoGrid videoRefs={videoRefs} MAX_PARTICIPANTS={MAX_PARTICIPANTS} />
        </div>
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
          nickname={nickname}
          sendMessage={sendMessage}
          socketId={socketId}
        />
      </div>
    </div>
  );
};

export default MeetingRoom;
