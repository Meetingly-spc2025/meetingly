import { useEffect } from "react";

const useSocket = ({
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
  setRecipientList,
  setSocketConnected,
}) => {
  useEffect(() => {
    if (!roomName) {
      alert("방 정보가 없습니다.");
      return navigate("/");
    }

    if (!nickname || !socketId) return;

    // socket 연결 상태 관리
    socket.on("connect", () => {
      console.log("[socket connected] id:", socket.id);
      setSocketConnected(true);
    });

    // 방 입장 시에 peer 연결 준비
    socket.on("welcome", async (users) => {
      console.log("[welcome] users:", users);
      for (const { id, nickname: userNick } of users) {
        createPeerConnection(id, userNick);
      }
    });

    // 새 유저 입장 시에 Offer/Answer 생성
    socket.on("user_joined", async ({ id, nickname: userNick }) => {
      const pc = createPeerConnection(id, userNick);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", offer, id, socketId);
    });

    async function flushIceQueue(userId) {
      const pc = peerConnections.current[userId];
      if (pc && pc.iceQueue) {
        for (const ice of pc.iceQueue) {
          try {
            await pc.addIceCandidate(ice);
          } catch (err) {
            console.error("addIceCandidate(flush) error:", err);
          }
        }
        pc.iceQueue = [];
      }
    }

    socket.on("offer", async (offer, callerId, callerNick) => {
      let pc = peerConnections.current[callerId];
      if (!pc) {
        pc = createPeerConnection(callerId, callerNick);
      }

      if (!pc.currentRemoteDescription) {
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", answer, callerId);
        await flushIceQueue(callerId);
      }
    });

    socket.on("answer", async (answer, userId) => {
      await peerConnections.current[userId]?.setRemoteDescription(answer);
      await flushIceQueue(userId);
    });

    // ICE Candidate 수신/연결
    socket.on("ice", async (ice, userId) => {
      const pc = peerConnections.current[userId];
      if (!pc) return;
      if (pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(ice);
        } catch (err) {
          console.error("addIceCandidate error:", err);
        }
      } else {
        if (!pc.iceQueue) pc.iceQueue = [];
        pc.iceQueue.push(ice);
      }
    });

    // 퇴장, 방 초과 인원, 공지 처리
    socket.on("left_room", (userId) => {
      peerConnections.current[userId]?.close();
      delete peerConnections.current[userId];
      clearSlot(userId);
    });

    socket.on("room_full", () => {
      alert("최대 4명까지만 참여할 수 있습니다.");
      socket.disconnect();
      socket.close();
      setSocketConnected(false);
      navigate("/", { replace: true });
    });

    socket.on("notice", (msg) => {
      addMessage({ system: true, message: msg });
    });

    // 닉네임 리스트 및 메세지 수신
    socket.on("updateNicks", (nickInfo) => {
      const recipients = Object.entries(nickInfo)
        .map(([id, name]) => ({ id, name }))
        .filter(({ id }) => String(id) !== String(socketId));
      setRecipientList(recipients);
    });

    socket.on("message", (msg) => {
      addMessage(msg);
    });

    return () => {
      socket.off("connect");
      socket.off("welcome");
      socket.off("user_joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice");
      socket.off("left_room");
      socket.off("room_full");
      socket.off("notice");
      socket.off("updateNicks");
      socket.off("message");
    };
  }, [
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
    setRecipientList,
    setSocketConnected,
  ]);
};

export default useSocket;
