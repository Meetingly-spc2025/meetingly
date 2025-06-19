"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import LoadingScreen from "../../components/LoadingScreen";
import "../../styles/Team/TeamManagement.css";
import TeamParticipationChart from "../../components/Chart/TeamParticipationChart";
import WeeklyMeetingChart from "../../components/Chart/WeeklyMeetingChart";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const isAdmin = userRole === "admin";

  // 관리자를 맨 위로 정렬하는 함수
  const sortMembers = (membersList) => {
    return [...membersList].sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;
      return 0;
    });
  };

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
        setMembers(sortMembers(res.data.members));
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
    Swal.fire({
      title: "팀원 강퇴",
      text: "정말 이 팀원을 강퇴하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "네, 강퇴합니다",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`/api/teams/${teamId}/members/${userId}`)
          .then(() => {
            Swal.fire({
              title: "강퇴 완료",
              text: "팀원이 성공적으로 강퇴되었습니다.",
              icon: "success",
              confirmButtonColor: "#0ea5e9",
            }).then(() => {
              window.location.reload();
            });
          })
          .catch((error) => {
            Swal.fire({
              title: "오류 발생",
              text: "팀원 강퇴 중 문제가 발생했습니다.",
              icon: "error",
              confirmButtonColor: "#0ea5e9",
            });
          });
      }
    });
  };

  const handleUpdateTeamName = () => {
    axios
      .patch(`/api/teams/update/${teamId}`, { name: editedTeamName })
      .then(() => {
        Swal.fire({
          title: "팀 이름 변경 완료",
          text: "팀 이름이 성공적으로 변경되었습니다.",
          icon: "success",
          confirmButtonColor: "#0ea5e9",
        }).then(() => {
          window.location.reload();
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "오류 발생",
          text: "팀 이름 변경 중 문제가 발생했습니다.",
          icon: "error",
          confirmButtonColor: "#0ea5e9",
        });
      });
  };

  const handleDeleteTeam = () => {
    Swal.fire({
      title: "팀 삭제",
      text: "정말 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "네, 삭제합니다",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`/api/teams/delete/${teamId}`)
          .then(() => {
            Swal.fire({
              title: "팀 삭제 완료",
              text: "팀이 성공적으로 삭제되었습니다.",
              icon: "success",
              confirmButtonColor: "#0ea5e9",
            }).then(() => {
              navigate("/team/join");
            });
          })
          .catch((error) => {
            Swal.fire({
              title: "오류 발생",
              text: "팀 삭제 중 문제가 발생했습니다.",
              icon: "error",
              confirmButtonColor: "#0ea5e9",
            });
          });
      }
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="team-container">
      <div className="page-card-container">
        <h1 className="page-title">팀 관리</h1>

        <div className="team-header-container">
          <div className="team-header">
            <div className="user-info">
              <img
                src={userImage || "/placeholder.svg"}
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
                    <button
                      className="edit-btn"
                      onClick={() => setIsEditingTeamName(true)}
                    >
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
                  Swal.fire({
                    title: "팀 링크가 복사되었습니다!",
                    icon: "success",
                    toast: true,
                    position: "top",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: false,
                    background: "var(--bg-secondary)",
                    color: "var(--gray-900)",
                    customClass: {
                      popup: "copy-toast",
                      title: "copy-toast-title",
                    },
                  });
                }}
              >
                👥 팀 링크 복사
              </button>
            </div>
          </div>

          {/* 차트 섹션 - 카드 형태로 묶음 */}
          <div className="charts-section">
            <h3>팀 활동 분석</h3>
            <div className="charts-container">
              <div className="chart-card">
                <h4 className="chart-title">팀원 참여도</h4>
                <TeamParticipationChart teamId={teamId} />
              </div>
              <div className="chart-card">
                <h4 className="chart-title">주간 회의 통계</h4>
                <WeeklyMeetingChart teamId={teamId} />
              </div>
            </div>
          </div>

          <div className="member-list">
            {members.map((member) => (
              <div
                key={member.user_id}
                className={`member-card ${member.role === "admin" ? "admin-member" : ""}`}
              >
                <img
                  src={member.user_image || "/placeholder.svg"}
                  alt={`${member.name}의 프로필`}
                  className="member-photo"
                />
                <div className="member-info">
                  <h3>
                    {member.name}
                    {member.role === "admin" && (
                      <span className="admin-badge">Admin</span>
                    )}
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
    </div>
  );
};

export default TeamManagementPage;
