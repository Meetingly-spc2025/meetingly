import { useCallback, useRef, useState, useMemo } from "react";

const useWebRTC = ({ socket, socketId, nickname, videoRefs }) => {
  const myStreamRef = useRef(null);
  const peerConnections = useRef({});
  const nicknamesRef = useRef({});

  const [cameras, setCameras] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const VITE_STUN_URL = import.meta.env.VITE_STUN_URL;
  const VITE_TURN_URL = import.meta.env.VITE_TURN_URL;
  const VITE_TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME;
  const VITE_TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL;

  const iceServers = useMemo(() => [
    { urls: VITE_STUN_URL },
    {
      urls: VITE_TURN_URL,
      username: VITE_TURN_USERNAME,
      credential: VITE_TURN_CREDENTIAL,
    },
  ], [
    VITE_STUN_URL,
    VITE_TURN_URL,
    VITE_TURN_USERNAME,
    VITE_TURN_CREDENTIAL,
  ]);

  // 코드흐름:: 내 스트림, 상대 스트림 관리 -> 각 PeerConnection 이벤트 -> 비디오 슬롯에 stream/nickname 배정

  // 각 userId에 대한 video slot에 stream과 닉네임 할당
  // 영상 스트림 유저 슬롯(최대 4명) 배정
  const assignStreamToSlot = useCallback(
    (userId, stream, name) => {
      let index = videoRefs.current.findIndex(
        (videoEl) => videoEl?.dataset?.userid === userId,
      );
      if (index !== -1) {
        const video = videoRefs.current[index];
        if (video.srcObject !== stream) {
          video.srcObject = stream;
        }
        return;
      }

      index = videoRefs.current.findIndex((videoEl) => !videoEl?.dataset?.userid);
      if (index === -1) return;

      const video = videoRefs.current[index];
      video.srcObject = stream;
      video.dataset.userid = userId;
      video.nextSibling.textContent = name;
    },
    [videoRefs],
  );

  // 사용자의 오디오/비디오 스트림을 가져오고, 내 비디오 slot에 연결. 기기 목록(카메라)도 설정
  const getMedia = useCallback(
    async (deviceId) => {
      try {
        const constraints = deviceId
          ? { audio: true, video: { deviceId: { exact: deviceId } } }
          : { audio: true, video: { facingMode: "user" } }; //기본카메라를 사용하도록 설정

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        // 사용자의 슬롯에 해당 스트림 연결
        myStreamRef.current = stream;

        assignStreamToSlot(socketId, stream, nickname);

        // 첫 실행 시 모든 카메라 장치 목록 불러오고, 현재 사용 중인 카메라 Id 저장
        if (!deviceId) {
          // 유저의 모든 디바이스 가져옴
          const devices = await navigator.mediaDevices.enumerateDevices();
          // 가져온 모든 디바이스 중 videoinput 선택
          const videoInputs = devices.filter((device) => device.kind === "videoinput");
          setCameras(videoInputs);
          const currentTrack = stream.getVideoTracks()[0];
          const currentDevice = videoInputs.find(
            (device) => device.label === currentTrack.label,
          );
          if (currentDevice) setSelectedDeviceId(currentDevice.deviceId);
        } else {
          setSelectedDeviceId(deviceId);
        }
      } catch (err) {
        console.error("[getMedia] error:", err);
      }
    },
    [nickname, socketId, assignStreamToSlot],
  );

  // 유저가 접속을 종료하거나 카메라 변경 시 해당 슬롯을 비움
  const clearSlot = useCallback(
    (userId) => {
      const index = videoRefs.current.findIndex(
        (videoEl) => videoEl?.dataset?.userid === userId,
      );
      if (index !== -1) {
        const video = videoRefs.current[index];
        video.srcObject?.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        video.removeAttribute("data-userid");
        video.nextSibling.textContent = "";
      }
    },
    [videoRefs],
  );

  // WebRTC 연결 생성 및 관리
  const createPeerConnection = useCallback(
    (userId, nick) => {
      const pc = new RTCPeerConnection({ iceServers, iceTransportPolicy: "all" });

      nicknamesRef.current[userId] = nick;
      peerConnections.current[userId] = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice", event.candidate, userId);
        }
      };

      pc.ontrack = (event) => {
        if (userId === socketId) return;
        assignStreamToSlot(
          userId,
          event.streams[0],
          nicknamesRef.current[userId] || "User",
        );
      };

      myStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, myStreamRef.current);
      });

      return pc;
    },
    [assignStreamToSlot, socket, socketId, iceServers]
  );

  // 마이크 및 카메라 켜기/끄기/변경
  const toggleMute = () => {
    myStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = muted));
    setMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    myStreamRef.current?.getVideoTracks().forEach((track) => (track.enabled = cameraOff));
    setCameraOff((prev) => !prev);
  };

  // 장치 변경 후 연결 트랙 교체
  const changeCamera = async (deviceId) => {
    clearSlot(socketId);
    await getMedia(deviceId);
    const videoTrack = myStreamRef.current?.getVideoTracks()[0];
    Object.values(peerConnections.current).forEach((pc) => {
      const sender = pc.getSenders().find((sender) => sender.track.kind === "video");
      if (sender && videoTrack) sender.replaceTrack(videoTrack);
    });
  };

  // 방 나가기 및 연결 종료
  const leaveRoom = useCallback(() => {
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    myStreamRef.current?.getTracks().forEach((track) => track.stop());
    socket.disconnect();
    socket.close();
    localStorage.removeItem("meeting_id");
  }, [socket]);

  return {
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
    setSelectedDeviceId,
  };
};

export default useWebRTC;
