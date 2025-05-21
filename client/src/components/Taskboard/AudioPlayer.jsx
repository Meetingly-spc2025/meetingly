import React from "react";
// import "./AudioPlayer.css";

const AudioPlayer = () => {
  return (
    <div className="audio-player">
      <h3>회의 음성</h3>
      <audio controls>
        <source src="/audio/sample.mp3" type="audio/mp3" />
        브라우저가 오디오를 지원하지 않습니다.
      </audio>
    </div>
  );
};

export default AudioPlayer;
