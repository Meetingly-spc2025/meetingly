import React from "react";
import useMediaRecorder from "./MediaRecorder";
import { BsFillMicFill, BsFillMicMuteFill, BsCameraVideoFill, BsCameraVideoOffFill, BsBoxArrowLeft } from "react-icons/bs";
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
  myStream,
  roomId,
}) => {
  
  const { recording, startRecording, stopRecording } = useMediaRecorder({ myStream, roomId });

  return (
    <div id="controls">
      <button onClick={toggleMute}>{muted ? <BsFillMicMuteFill style={{ fontSize: "1.5rem" }} /> : <BsFillMicFill style={{ fontSize: "1.5rem" }} />}</button>
      <button onClick={toggleCamera}>
        {cameraOff ? <BsCameraVideoOffFill style={{ fontSize: "1.5rem" }} /> : <BsCameraVideoFill style={{ fontSize: "1.5rem" }} />}
      </button>
      {!recording ? (
        <button onClick={startRecording}><MdFiberManualRecord style={{ fontSize: "1.5rem", color: "red" }} /></button>
      ) : (
        <button onClick={stopRecording}><MdStop style={{ fontSize: "1.5rem", color: "black" }} /></button>
      )}
      <select value={selectedDeviceId || ""} onChange={changeCamera}>
        {cameras.map((c) => (
          <option key={c.deviceId} value={c.deviceId}>
            {c.label}
          </option>
        ))}
      </select>
      <button onClick={handleLeaveRoom}><BsBoxArrowLeft style={{ fontSize: "1.5rem" }} /></button>
    </div>
  );
};

export default Controls;
