import React from "react";
import "../styles/StartMeeting.css";

const StartMeeting = () => {
  return (
    <div className="start-meeting-container">
      <h2>회의 시작</h2>
      <form className="start-meeting-form">
        <label>회의 제목</label>
        <input type="text" placeholder="예: 프로젝트 킥오프" />

        <label>참여자 이메일</label>
        <input type="email" placeholder="email@example.com" />

        <button type="submit">회의 시작</button>
      </form>
    </div>
  );
};

export default StartMeeting;
