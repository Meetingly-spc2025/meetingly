import React from "react";

const VideoGrid = ({ videoRefs, MAX_PARTICIPANTS }) => (
  <div id="video-grid">
    {[...Array(MAX_PARTICIPANTS)].map((_, i) => (
      <div className="participant" key={i}>
        <video
          autoPlay
          playsInline
          ref={(el) => (videoRefs.current[i] = el)}
          className="video-tile"
        />
        <div className="video-nickname"></div>
      </div>
    ))}
  </div>
);

export default VideoGrid;
