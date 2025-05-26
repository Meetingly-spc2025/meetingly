// src/pages/TeamManagement.jsx
import React from "react";
import "../../styles/Task/TeamManagement.css";

const dummyMembers = [
  {
    id: 1,
    name: "이름 1",
    email: "email1@example.com",
    description: "한 줄 설명",
  },
  {
    id: 2,
    name: "이름 2",
    email: "email2@example.com",
    description: "한 줄 설명",
  },
  {
    id: 3,
    name: "이름 3",
    email: "email3@example.com",
    description: "한 줄 설명",
  },
  {
    id: 4,
    name: "이름 4",
    email: "email4@example.com",
    description: "한 줄 설명",
  },
  {
    id: 5,
    name: "이름 5",
    email: "email5@example.com",
    description: "한 줄 설명",
  },
];

const TeamManagement = () => {
  return (
    <div className="team-container">
      <div className="team-header">
        <div className="user-info">
          <img
            src="/profile-placeholder.png"
            alt="프로필"
            className="profile-img"
          />
          <div>
            <p className="greeting">
              안녕하세요, <span className="highlight">홍길동</span> 님
            </p>
            <p className="email">meetingly@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="team-box">
        <div className="team-box-header">
          <div>
            <h2>Team 이름</h2>
            <span className="subtext">나의 팀 보기</span>
          </div>
          <button className="copy-btn">👥 팀 링크 복사</button>
        </div>

        <div className="member-list">
          {dummyMembers.map((member) => (
            <div key={member.id} className="member-card">
              <div className="member-photo" />
              <div className="member-info">
                <h3>{member.name}</h3>
                <p>{member.email}</p>
                <p className="description">{member.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={`page-btn ${n === 1 ? "active" : ""}`}>
              {n}
            </button>
          ))}
          <span className="next-page">{`>`}</span>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
