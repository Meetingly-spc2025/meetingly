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
  setDmTargets,
  setSocketConnected,
}) => {
  useEffect(() => {
    if (!roomName) {
      alert("방 정보가 없습니다.");
      return navigate("/");
    }

    if (!nickname || !socketId) return;
    // socket.connect();

    socket.on("connect", () => {
      console.log("[socket connected] id:", socket.id);
      setSocketConnected(true);
    });

    socket.on("welcome", async (users) => {
      console.log("[welcome] users:", users);
      for (const { id, nickname: userNick } of users) {
        createPeerConnection(id, userNick);
      }
    });

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

    socket.on("updateNicks", (nickInfo) => {
      const targets = Object.entries(nickInfo)
        .map(([id, name]) => ({ id, name }))
        .filter(({ id }) => String(id) !== String(socketId));
      setDmTargets(targets);
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
    setDmTargets,
    setSocketConnected,
  ]);
};

export default useSocket;
