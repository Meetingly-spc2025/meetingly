import { useCallback, useRef, useState } from "react";

const useWebRTC = ({ socket, socketId, nickname, videoRefs }) => {
  const myStreamRef = useRef(null);
  const peerConnections = useRef({});
  const nicknamesRef = useRef({});

  const [cameras, setCameras] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const assignStreamToSlot = useCallback(
    (userId, stream, name) => {
      let index = videoRefs.current.findIndex((videoEl) => videoEl?.dataset?.userid === userId);
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
    [videoRefs]
  );

  const getMedia = useCallback(
    async (deviceId) => {
      try {
        const constraints = deviceId
          ? { audio: true, video: { deviceId: { exact: deviceId } } }
          : { audio: true, video: { facingMode: "user" } };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        myStreamRef.current = stream;

        assignStreamToSlot(socketId, stream, nickname);

        if (!deviceId) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((device) => device.kind === "videoinput");
          setCameras(videoInputs);
          const currentTrack = stream.getVideoTracks()[0];
          const currentDevice = videoInputs.find((device) => device.label === currentTrack.label);
          if (currentDevice) setSelectedDeviceId(currentDevice.deviceId);
        } else {
          setSelectedDeviceId(deviceId);
        }
      } catch (err) {
        console.error("[getMedia] error:", err);
      }
    },
    [nickname, socketId, assignStreamToSlot]
  );

  const clearSlot = useCallback(
    (userId) => {
      const index = videoRefs.current.findIndex((videoEl) => videoEl?.dataset?.userid === userId);
      if (index !== -1) {
        const video = videoRefs.current[index];
        video.srcObject?.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        video.removeAttribute("data-userid");
        video.nextSibling.textContent = "";
      }
    },
    [videoRefs]
  );

  const createPeerConnection = useCallback(
    (userId, nick) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      nicknamesRef.current[userId] = nick;
      peerConnections.current[userId] = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice", event.candidate, userId);
        }
      };

      pc.ontrack = (event) => {
        if (userId === socketId) return;
        assignStreamToSlot(userId, event.streams[0], nicknamesRef.current[userId] || "User");
      };

      myStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, myStreamRef.current);
      });

      return pc;
    },
    [assignStreamToSlot, socket, socketId]
  );

  const toggleMute = () => {
    myStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = muted));
    setMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    myStreamRef.current?.getVideoTracks().forEach((track) => (track.enabled = cameraOff));
    setCameraOff((prev) => !prev);
  };

  const changeCamera = async (deviceId) => {
    clearSlot(socketId);
    await getMedia(deviceId);
    const videoTrack = myStreamRef.current?.getVideoTracks()[0];
    Object.values(peerConnections.current).forEach((pc) => {
      const sender = pc.getSenders().find((sender) => sender.track.kind === "video");
      if (sender && videoTrack) sender.replaceTrack(videoTrack);
    });
  };

  const leaveRoom = useCallback(() => {
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    myStreamRef.current?.getTracks().forEach((track) => track.stop());
    socket.disconnect();
    socket.close();
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
