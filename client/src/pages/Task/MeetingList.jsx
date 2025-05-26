import React from "react";
import "../../styles/Task/MeetingList.css";
import { useNavigate } from "react-router-dom";

const meetings = [
  {
    id: 1,
    title: "회의 1",
    members: "홍길동, 이순신, 강감찬",
    host: "강감찬",
    date: "2025. 05. 10",
  },
  {
    id: 2,
    title: "회의 2",
    members: "홍길동, 이순신, 강감찬",
    host: "강감찬",
    date: "2025. 05. 10",
  },
  {
    id: 3,
    title: "회의 3",
    members: "홍길동, 이순신, 강감찬",
    host: "강감찬",
    date: "2025. 05. 10",
  },
  {
    id: 4,
    title: "회의 4",
    members: "홍길동, 이순신, 강감찬",
    host: "강감찬",
    date: "2025. 05. 10",
  },
  {
    id: 5,
    title: "회의 5",
    members: "홍길동, 이순신, 강감찬",
    host: "강감찬",
    date: "2025. 05. 10",
  },
  {
    id: 6,
    title: "회의 6",
    members: "홍길동, 이순신, 강감찬",
    host: "강감찬",
    date: "2025. 05. 10",
  },
];

const MeetingList = () => {
  const navigate = useNavigate();

  return (
    <div className="meeting-page-wrapper">
      <div className="main-content">
        <header className="main-header">
          <div className="profile">
            <img src="/profile.png" alt="profile" />
            <div>
              <div className="greeting">
                안녕하세요, <span className="highlight">홍길동</span> 님
              </div>
              <div className="email">meetingly@gmail.com</div>
            </div>
          </div>
        </header>

        <section className="meeting-list">
          <h2>전체 회의 목록</h2>
          <div className="tab-bar">
            <span className="active">최근 참여한 회의</span>
            <span>내가 주최한 회의</span>
            <select>
              <option>최신순</option>
            </select>
          </div>

          <div className="meeting-cards">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="meeting-card">
                <div className="meeting-title">{meeting.title}</div>
                <div className="meeting-info">{meeting.members}</div>
                <div className="meeting-host">{meeting.host}</div>
                <div className="meeting-date">{meeting.date}</div>
                <button
                  className="view-button"
                  onClick={() => navigate(`/meeting/${meeting.id}`)}
                >
                  자세히 보기
                </button>
              </div>
            ))}
          </div>

          <div className="pagination">
            {[1, 2, 3, 4, 5].map((num) => (
              <button key={num} className={num === 1 ? "active" : ""}>
                {num}
              </button>
            ))}
            <span>›</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MeetingList;
