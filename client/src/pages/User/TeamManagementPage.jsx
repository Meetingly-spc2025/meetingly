"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import LoadingScreen from "../../components/LoadingScreen"
import "../../styles/Team/TeamManagement.css"
import TeamParticipationChart from "../../components/Chart/TeamParticipationChart"
import WeeklyMeetingChart from "../../components/Chart/WeeklyMeetingChart"

const TeamManagementPage = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [teamName, setTeamName] = useState("")
  const [teamUrl, setTeamUrl] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [teamId, setTeamId] = useState("")
  const [userRole, setUserRole] = useState("")
  const [userImage, setUserImage] = useState("")
  const [editedTeamName, setEditedTeamName] = useState("")
  const [isEditingTeamName, setIsEditingTeamName] = useState(false)

  const isAdmin = userRole === "admin"

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("/api/users/jwtauth", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log("user 정보 :: ", res.data.user)

        const user = res.data.user
        setTeamId(user.teamId)
        setUserEmail(user.email)
        setUserName(user.name)
        setUserRole(user.role)
        setUserImage(user.userImage)
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`/api/teams/${teamId}/members`)
        console.log("res.data :: ", res.data)
        setMembers(res.data.members)
        setTeamName(res.data.teamName)
        setTeamUrl(res.data.teamUrl)
        setEditedTeamName(res.data.teamName)
      } catch (error) {
        console.error("팀원 목록 가져오기 실패", error)
      } finally {
        setLoading(false)
      }
    }

    if (teamId) fetchMembers()
  }, [teamId])

  const handleKickMember = (userId) => {
    if (window.confirm("정말 이 팀원을 강퇴하시겠습니까?")) {
      alert(`강퇴 처리: user_id ${userId}`)
      axios.delete(`/api/teams/${teamId}/members/${userId}`)
    }
  }

  const handleUpdateTeamName = () => {
    alert(`팀 이름 변경: ${editedTeamName}`)
    setTeamName(editedTeamName)
    setIsEditingTeamName(false)
    axios.patch(`/api/teams/update/${teamId}`, { name: editedTeamName })
  }

  const handleDeleteTeam = () => {
    if (window.confirm("정말 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      alert("팀 삭제 처리")
      axios.delete(`/api/teams/delete/${teamId}`)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="team-container">
      <div className="page-card-container">
        <h1 className="page-title">팀 관리 대시보드</h1>

        {/* 상단 정보 섹션 */}
        <div className="top-info-section">
          <div className="user-info-card">
            <img src={userImage || "/placeholder.svg"} alt="프로필" className="profile-img" />
            <div className="user-details">
              <h2>
                안녕하세요, <span className="highlight">{userName}</span> 님
              </h2>
              <p className="email">{userEmail}</p>
            </div>
          </div>

          <div className="team-info-card">
            <h2>{teamName}</h2>
            <p style={{ color: "#6b7280", margin: "0 0 1rem 0" }}>팀 멤버 {members.length}명</p>
            <div className="team-url-section">
              <input type="text" value={`${window.location.origin}/team/${teamUrl}`} className="team-url" disabled />
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/team/${teamUrl}`)
                  alert("팀 링크가 복사되었습니다!")
                }}
              >
                👥 복사
              </button>
            </div>
          </div>
        </div>

        {/* 차트 섹션 */}
        <div className="charts-section">
          <h3>팀 활동 분석</h3>
          <div className="charts-container">
            <div className="chart-card">
              <h4 className="chart-title">참여도</h4>
              <div className="chart-container">
                <TeamParticipationChart teamId={teamId} />
              </div>
            </div>
            <div className="chart-card">
              <h4 className="chart-title">회의 통계</h4>
              <div className="chart-container">
                <WeeklyMeetingChart teamId={teamId} />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 섹션 - 관리자 컨트롤과 멤버 목록 */}
        <div className="bottom-section">
          {/* 관리자 컨트롤 */}
          {isAdmin && (
            <div className="admin-controls">
              <h3>팀 관리</h3>
              <div className="edit-team-name">
                <input
                  type="text"
                  value={editedTeamName}
                  onChange={(e) => setEditedTeamName(e.target.value)}
                  className="teamname-input"
                  disabled={!isEditingTeamName}
                  placeholder="팀 이름"
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
                          setIsEditingTeamName(false)
                          setEditedTeamName(teamName)
                        }}
                      >
                        ❌ 취소
                      </button>
                    </>
                  )}
                </div>
              </div>
              <button className="delete-btn" onClick={handleDeleteTeam}>
                🗑️ 팀 삭제
              </button>
            </div>
          )}

          {/* 멤버 목록 */}
          <div className="members-section">
            <h3>팀 멤버 ({members.length}명)</h3>
            <div className="member-list">
              {members.map((member) => (
                <div key={member.user_id} className={`member-card ${member.role === "admin" ? "admin-member" : ""}`}>
                  <div className="member-photo" />
                  <div className="member-info">
                    <h4>
                      {member.name}
                      {member.role === "admin" && <span className="admin-badge">Admin</span>}
                    </h4>
                    <p>{member.email}</p>
                    <p style={{ fontStyle: "italic", color: "#9ca3af" }}>{member.nickname}</p>
                  </div>
                  {isAdmin && member.role !== "admin" && (
                    <button className="kick-btn" onClick={() => handleKickMember(member.user_id)}>
                      강퇴
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamManagementPage
