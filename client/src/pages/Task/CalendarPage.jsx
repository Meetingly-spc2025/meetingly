import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/Task/CalendarPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CalendarPage = () => {
  const [meetingsByDate, setMeetingsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState(null);
  const navigate = useNavigate();

  // 팀 ID 가져오기
  useEffect(() => {
    const fetchUserTeam = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users/jwtauth", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.user;
        if (user.teamId) {
          setTeamId(user.teamId);
        } else {
          navigate("/team/join");
        }
      } catch (err) {
        console.error("유저 팀 정보 확인 실패:", err);
        alert("로그인이 필요합니다. 😊");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeam();
  }, [navigate]);

  // 현재 달 회의 가져오기
  const fetchMeetingsForMonth = async (year, month) => {
    if (!teamId) return;
    try {
      const res = await axios.get(
        `/api/meetingData/meetinglists/task/${teamId}/by-month?year=${year}&month=${month}`
      );
      const meetings = res.data.meetings;
      const grouped = meetings.reduce((acc, meeting) => {
        const dateKey = new Date(meeting.date).toLocaleDateString("sv-SE");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(meeting);
        return acc;
      }, {});
      setMeetingsByDate(grouped);
    } catch (err) {
      console.error("월간 회의 목록 불러오기 오류:", err);
    }
  };

  // 페이지 처음 로드될 때 → 현재 달 데이터 가져오기
  useEffect(() => {
    if (!teamId) return;
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    fetchMeetingsForMonth(year, month);
  }, [teamId]);

  // 달력이 보여주는 달 바뀔 때도 데이터 갱신
  const handleActiveStartDateChange = ({ activeStartDate }) => {
    const year = activeStartDate.getFullYear();
    const month = activeStartDate.getMonth() + 1;
    fetchMeetingsForMonth(year, month);
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="calendarpage-container">
      <h2 className="calendarpage-title">📅 캘린더</h2>
      <div className="calendar-wrapper">
        <Calendar
          onActiveStartDateChange={handleActiveStartDateChange}
          tileContent={({ date }) => {
            const formattedDate = date.toLocaleDateString("sv-SE");
            const meetings = meetingsByDate[formattedDate];
            if (!meetings) return null;
            return (
              <div className="calendar-tile-meetings">
                {meetings.map((m) => (
                  <div
                    key={m.meeting_id}
                    className="calendar-tile-meeting-card"
                    onClick={() =>
                      navigate(`/meeting/${m.meeting_id}?teamId=${teamId}`)
                    }
                  >
                    <span className="calendar-tile-meeting-title">
                      {m.title}
                    </span>
                  </div>
                ))}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
