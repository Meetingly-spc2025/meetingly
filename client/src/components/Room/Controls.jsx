import React from "react";

const Controls = ({
  muted,
  cameraOff,
  cameras,
  selectedDeviceId,
  toggleMute,
  toggleCamera,
  changeCamera,
  handleLeaveRoom,
}) => {
  return (
    <div id="controls">
      <button onClick={toggleMute}>{muted ? "Unmute" : "Mute"}</button>
      <button onClick={toggleCamera}>
        {cameraOff ? "카메라 켜기" : "카메라 끄기"}
      </button>
      <select value={selectedDeviceId || ""} onChange={changeCamera}>
        {cameras.map((c) => (
          <option key={c.deviceId} value={c.deviceId}>
            {c.label}
          </option>
        ))}
      </select>
      <button onClick={handleLeaveRoom}>나가기</button>
    </div>
  );
};

export default Controls;
