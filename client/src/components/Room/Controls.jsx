import React from "react";
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
  const handleStartRecording = () => {
    socket.emit("start_recording", roomId);
    setRecording(true);
  };

  const handleStopRecording = () => {
    socket.emit("stop_recording", roomId);
    setRecording(false);
  };

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
          <button onClick={handleStopRecording}>
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
