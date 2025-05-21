// components/Taskboard/TaskCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/TaskCard.css";

const MeetingCard = ({ meeting }) => {
  const navigate = useNavigate();

  const handleDetailClick = () => {
    navigate(`/meetings/${meeting.id}`);
  };

  return (
    <div className="task-card">
      <div className="task-content">
        <h3 className="task-title">{meeting.title}</h3>
        <p className="task-date">📅 {meeting.date}</p>
        <p className="task-participants">👥 {meeting.participants}명 참여</p>
        <button className="task-detail-btn" onClick={handleDetailClick}>
          자세히 보기
        </button>
      </div>
    </div>
  );
};

export default MeetingCard;
