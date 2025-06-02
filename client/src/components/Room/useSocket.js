import { useEffect } from "react";

//전체적인 코드 흐름:: connect이벤트 -> join_room 이후 welcome, user_joined 이벤트로 offer/answer 교환
//                -> ICE candidate 교환

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

    //소켓 연결 이벤트
    socket.on("connect", () => {
      console.log("[소켓연결됨] id:", socket.id);
      setSocketConnected(true);
    });

    //방 입장시 기존 유저 목록 -> 각 PeerConnection 준비
    socket.on("welcome", async (users) => {
      console.log("[welcome] users:", users);
      for (const { id, nickname: userNick } of users) {
        createPeerConnection(id, userNick);
      }
    });

    //새로운 참가자가 입장 -> offer 생성 및 전송
    socket.on("user_joined", async ({ id, nickname: userNick }) => {
      const pc = createPeerConnection(id, userNick);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", offer, id, socketId);
    });

    //먼저 도착해서 바로 추가하지 못한 ICE 후보들을 임시 배열(큐)에 쌓아두었다가 remoteDescription이 준비되면 한 번에 모두 적용하는 함수
    //이 함수를 추가한 이유가 remoteDescription이 준비되기 전에 addIceCandidate이 호출되니까 에러가 생겼음
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

    //offer 수신 시 PeerConnection 생성 -> setRemoteDescription 후 answer 생성/전송
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

    //answer 수신 시 setRemoteDescription
    socket.on("answer", async (answer, userId) => {
      await peerConnections.current[userId]?.setRemoteDescription(answer);
      await flushIceQueue(userId);
    });

    //ice candidate 수신 시 addIceCandidate
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

    // 퇴장 시 해당 PeerConnection 종료 및 슬롯 비우기
    socket.on("left_room", (userId) => {
      peerConnections.current[userId]?.close();
      delete peerConnections.current[userId];
      clearSlot(userId);
    });

    //방 최대 인원 설정
    socket.on("room_full", () => {
      alert("최대 4명까지만 참여할 수 있습니다.");
      socket.disconnect();
      socket.close();
      setSocketConnected(false);
      navigate("/", { replace: true });
    });

    //아래는 채팅관련 이벤트:: 시스템 메세지, 닉네임 리스트, 채팅
    socket.on("notice", (msg) => {
      addMessage({ system: true, message: msg });
    });

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
