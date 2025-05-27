import React from "react";

const VideoGrid = ({ videoRefs, MAX_PARTICIPANTS = 4 }) => {
  return (
    <div className="video-grid">
      {[...Array(MAX_PARTICIPANTS)].map((_, i) => (
        <div className="participant" key={i}>
          <video
            autoPlay
            playsInline
            muted={i === 0}
            ref={(el) => (videoRefs.current[i] = el)}
            className="video-tile"
            data-userid=""
          />
          <div className="video-nickname"></div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
