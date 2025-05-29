// src/pages/TeamManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingScreen from "../../components/LoadingScreen";
import "../../styles/Task/TeamManagement.css";

const TeamManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [teamUrl, setTeamUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users/jwtauth", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("user 정보 :: ", res.data.user);

        setTeamId(res.data.user.teamId);
        setUserEmail(res.data.user.email);
        setUserName(res.data.user.name);
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`/api/teams/${teamId}/members`);
        console.log("res.data :: ", res.data);
        setMembers(res.data.members);
        setTeamName(res.data.teamName);
        setTeamUrl(res.data.teamUrl);
      } catch (error) {
        console.error("팀원 목록 가져오기 실패", error);
      } finally {
        return <LoadingScreen />;
      }
    };

    fetchMembers();
  }, [teamId]);

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
              안녕하세요, <span className="highlight">{userName}</span> 님
            </p>
            <p className="email">{userEmail}</p>
          </div>
        </div>
      </div>

      <div className="team-box">
        <div className="team-box-header">
          <div>
            <h2>{teamName}</h2>
            <span className="subtext">나의 팀 보기</span>
          </div>
          <div className="link-copy-wrapper">
            <input
              type="text"
              value={`${window.location.origin}/team/${teamUrl}`}
              className="team-url"
              disabled
            />

            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/team/${teamUrl}`,
                );
                alert("팀 링크가 복사되었습니다!");
              }}
            >
              👥 팀 링크 복사
            </button>
          </div>
        </div>

        <div className="member-list">
          {members.map((member) => (
            <div key={member.user_id} className="member-card">
              <div className="member-photo" />
              <div className="member-info">
                <h3>{member.name}</h3>
                <p>{member.email}</p>
                <p className="description">{member.nickname}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션은 필요시 동적으로 */}
        <div className="pagination">
          {[1].map((n) => (
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
