import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/CalendarPage.css";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="calendarpage-container">
      <h2 className="calendarpage-title">📅 캘린더</h2>
      <div className="calendar-wrapper">
        <Calendar onClickDay={handleDateChange} />
      </div>
      {selectedDate && (
        <p className="selected-date">
          선택한 날짜: <strong>{selectedDate.toDateString()}</strong>
        </p>
      )}
    </div>
  );
};

export default CalendarPage;
