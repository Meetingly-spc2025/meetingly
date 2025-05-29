import React from "react";

const VideoGrid = ({ videoRefs, MAX_PARTICIPANTS = 4 }) => {
  return (
    <div className="video-grid">
      {[...Array(MAX_PARTICIPANTS)].map((_, idx) => (
        <div className="participant" key={idx}>
          <video
            autoPlay
            playsInline
            muted={idx === 0}
            ref={(videoEl) => (videoRefs.current[idx] = videoEl)}
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
