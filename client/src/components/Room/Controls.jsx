import React, { useEffect, useRef, useState } from "react";
import {
  BsFillMicFill,
  BsFillMicMuteFill,
  BsCameraVideoFill,
  BsCameraVideoOffFill,
  BsBoxArrowLeft,
} from "react-icons/bs";
import { MdFiberManualRecord, MdStop } from "react-icons/md";

const Controls = ({
  muted,
  cameraOff,
  cameras,
  selectedDeviceId,
  toggleMute,
  toggleCamera,
  changeCamera,
  handleLeaveRoom,
  roomId,
  isCreator,
  socket,
  recording,
  setRecording,
  recordingDone,
}) => {
  const [canStopRecording, setCanStopRecording] = useState(false);
  const timerRef = useRef(null);

  const handleStartRecording = () => {
    socket.emit("start_recording", roomId);
    setRecording(true);
    setCanStopRecording(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCanStopRecording(true), 60 * 1000);
  };

  const handleStopRecording = () => {
    socket.emit("stop_recording", roomId);
    setRecording(false);
    setCanStopRecording(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!recording) {
      setCanStopRecording(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [recording]);

  return (
    <div id="controls">
      <button onClick={toggleMute}>
        {muted ? (
          <BsFillMicMuteFill style={{ fontSize: "1.5rem" }} />
        ) : (
          <BsFillMicFill style={{ fontSize: "1.5rem" }} />
        )}
      </button>
      <button onClick={toggleCamera}>
        {cameraOff ? (
          <BsCameraVideoOffFill style={{ fontSize: "1.5rem" }} />
        ) : (
          <BsCameraVideoFill style={{ fontSize: "1.5rem" }} />
        )}
      </button>

      {isCreator &&
        !recordingDone &&
        (!recording ? (
          <button onClick={handleStartRecording}>
            <MdFiberManualRecord style={{ fontSize: "1.5rem", color: "red" }} />
          </button>
        ) : (
          <button 
            onClick={handleStopRecording}
            disabled={!canStopRecording}
            style={{
              opacity: canStopRecording ? 1 : 0.5,
              cursor: canStopRecording ? "pointer" : "not-allowed",
            }}
          >
            <MdStop style={{ fontSize: "1.5rem", color: "black" }} />
          </button>
        ))}
      <select value={selectedDeviceId || ""} onChange={changeCamera}>
        {cameras.map((camera) => (
          <option key={camera.deviceId} value={camera.deviceId}>
            {camera.label}
          </option>
        ))}
      </select>
      <button onClick={handleLeaveRoom}>
        <BsBoxArrowLeft style={{ fontSize: "1.5rem" }} />
      </button>
    </div>
  );
};

export default Controls;
