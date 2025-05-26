import React from "react";
import "../../styles/Task/MeetingCard.css";

const MeetingCard = ({ meeting, onClick }) => {
  return (
    <div className="meetinglist-card" onClick={onClick}>
      <div className="meetinglist-title">{meeting.title}</div>
      <div className="meetinglist-info">{meeting.members}</div>
      <div className="meetinglist-host">{meeting.host}</div>
      <div className="meetinglist-date">{meeting.date}</div>
      <button className="meetinglist-view-button">자세히 보기</button>
    </div>
  );
};

export default MeetingCard;
