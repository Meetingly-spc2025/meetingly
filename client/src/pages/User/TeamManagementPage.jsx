// src/pages/TeamManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingScreen from "../../components/LoadingScreen";
import "../../styles/Team/TeamManagement.css";

const TeamManagementPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [teamUrl, setTeamUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userImage, setUserImage] = useState("");
  const [editedTeamName, setEditedTeamName] = useState("");
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);

  const isAdmin = userRole === "admin";

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

        const user = res.data.user;
        setTeamId(user.teamId);
        setUserEmail(user.email);
        setUserName(user.name);
        setUserRole(user.role);
        setUserImage(user.userImage);
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
        setEditedTeamName(res.data.teamName);
      } catch (error) {
        console.error("팀원 목록 가져오기 실패", error);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) fetchMembers();
  }, [teamId]);

  const handleKickMember = (userId) => {
    if (window.confirm("정말 이 팀원을 강퇴하시겠습니까?")) {
      alert(`강퇴 처리: user_id ${userId}`);
      axios.delete(`/api/teams/${teamId}/members/${userId}`);
    }
  };

  const handleUpdateTeamName = () => {
    alert(`팀 이름 변경: ${editedTeamName}`);
    setTeamName(editedTeamName);
    axios.patch(`/api/teams/update/${teamId}`, { name: editedTeamName });
  };

  const handleDeleteTeam = () => {
    if (window.confirm("정말 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      alert("팀 삭제 처리");
      axios.delete(`/api/teams/delete/${teamId}`);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="team-container">
      <div className="team-header">
        <div className="user-info">
          <img src={userImage} alt="프로필" className="profile-img" />
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

        {isAdmin && (
          <div className="admin-controls">
            <div className="edit-team-name">
              <input
                type="text"
                value={editedTeamName}
                onChange={(e) => setEditedTeamName(e.target.value)}
                className="teamname-input"
                disabled={!isEditingTeamName}
              />
              <div className="button-group">
                {!isEditingTeamName ? (
                  <button className="edit-btn" onClick={() => setIsEditingTeamName(true)}>
                    ✏️ 수정
                  </button>
                ) : (
                  <>
                    <button className="update-btn" onClick={handleUpdateTeamName}>
                      ✅ 저장
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setIsEditingTeamName(false);
                        setEditedTeamName(teamName);
                      }}
                    >
                      ❌ 취소
                    </button>
                  </>
                )}
              </div>
            </div>
            <button className="delete-btn" onClick={handleDeleteTeam}>
              팀 삭제
            </button>
          </div>
        )}

        <div className="member-list">
          {members.map((member) => (
            <div
              key={member.user_id}
              className={`member-card ${member.role === "admin" ? "admin-member" : ""}`}
            >
              <div className="member-photo" />
              <div className="member-info">
                <h3>
                  {member.name}
                  {member.role === "admin" && <span className="admin-badge">Admin</span>}
                </h3>
                <p>{member.email}</p>
                <p className="description">{member.nickname}</p>
              </div>
              {isAdmin && member.role !== "admin" && (
                <button
                  className="kick-btn"
                  onClick={() => handleKickMember(member.user_id)}
                >
                  강퇴
                </button>
              )}
            </div>
          ))}
        </div>

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

export default TeamManagementPage;
