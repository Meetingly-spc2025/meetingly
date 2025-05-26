import React from "react";
import "../styles/LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p className="loading-text">Meetingly 로딩 중...</p>
    </div>
  );
};

export default LoadingScreen;
