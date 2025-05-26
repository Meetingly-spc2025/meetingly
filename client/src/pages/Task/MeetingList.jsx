// kanban/src/pages/MeetingList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Task/MeetingList.css";
import MeetingCard from "../../components/Taskboard/MeetingCard";

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [page, setPage] = useState(1);
  const totalPages = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/meetinglists?page=${page}`);
        const data = await res.json();
        setMeetings(data);
      } catch (err) {
        console.error("데이터 불러오기 오류:", err);
      }
    };

    fetchMeetings();
  }, [page]);

  return (
    <div className="meetinglist-wrapper">
      <div className="meetinglist-main-content">
        <header className="meetinglist-header">
          <div className="meetinglist-profile">
            <img src="/profile.png" alt="profile" />
            <div>
              <div className="meetinglist-greeting">
                안녕하세요, <span className="highlight">홍길동</span> 님
              </div>
              <div className="meetinglist-email">meetingly@gmail.com</div>
            </div>
          </div>
        </header>

        <section className="meetinglist-section">
          <h2>전체 회의 목록</h2>
          <div className="meetinglist-cards">
            {meetings.map((meeting) => (
              <MeetingCard
                key={meeting.meeting_id}
                meeting={meeting}
                onClick={() => navigate(`/meeting/${meeting.meeting_id}`)}
              />
            ))}
          </div>

          <div className="meetinglist-pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={num === page ? "active" : ""}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            ))}
            <span onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}>›</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MeetingList;
