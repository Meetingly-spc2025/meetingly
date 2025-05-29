import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/Task/MeetingList.css";
import MeetingCard from "../../components/Taskboard/MeetingCard";

const MeetingList = () => {
  const { id: teamId } = useParams();
  const [meetings, setMeetings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        console.log("팀 ID (from URL):", teamId);
        const res = await axios.get(`/api/meetinglists/task/${teamId}?page=${page}`);
        const data = res.data;
        setMeetings(data.meetings);
        setTotalPages(Math.ceil(data.totalDataCount / 6));
      } catch (err) {
        console.error("회의 목록 데이터 불러오기 오류:", err);
      }
    };

    if (teamId) fetchMeetings();
  }, [page, teamId]);

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
                onClick={() =>
                  navigate(`/meeting/${meeting.meeting_id}?teamId=${teamId}`)
                }
              />
            ))}
          </div>

          <div className="meetinglist-pagination">
            <span
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className={page === 1 ? "disabled" : ""}
            >
              ‹
            </span>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={num === page ? "active" : ""}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            ))}

            <span
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className={page === totalPages ? "disabled" : ""}
            >
              ›
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MeetingList;
