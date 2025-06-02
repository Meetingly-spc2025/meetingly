import React from "react";
import "../../styles/Task/CalendarPage.css";

const CalendarCard = ({ meeting, onClick }) => {
  return (
    <div className="calendarcard-card" onClick={onClick}>
      <div className="calendarcard-title">{meeting.title}</div>
      <div className="calendarcard-info">참여자: {meeting.members}</div>
    </div>
  );
};

export default CalendarCard;
