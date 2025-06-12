"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import SummaryBlock from "../../components/Taskboard/SummaryBlock"
import DiscussionList from "../../components/Taskboard/DiscusstionList"
import KanbanBoard from "../../components/Kanban/KanbanBoard"
import MeetingInfo from "../../components/Taskboard/MeetingInfo"
import TeamTaskChart from "../../components/Chart/TeamTaskChart"
import WordCloudChart from "../../components/Chart/WordCloudChart"
import "../../styles/Task/MeetingDetail.css"
import { useParams, useSearchParams } from "react-router-dom"

const MeetingDetail = () => {
  const { id: meetingId } = useParams()
  const [searchParams] = useSearchParams()
  const teamId = searchParams.get("teamId")

  const [sections, setSections] = useState([
    { type: "info", collapsed: false },
    { type: "discussion", collapsed: true },
    { type: "summary", collapsed: true },
    { type: "kanban", collapsed: true },
  ])

  const [meetingInfo, setMeetingInfo] = useState(null)
  const [summaries, setSummaries] = useState([])
  const [kanbanTasks, setKanbanTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])

  // 사용자 정보 (userId 등)
  const [userInfo, setUserInfo] = useState({})
  const token = localStorage.getItem("token")

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get("/api/users/jwtauth", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const user = res.data.user
        setUserInfo({
          userId: user.id,
          name: user.name,
          email: user.email,
        })
      } catch (err) {
        console.error("유저 정보 조회 실패:", err)
      }
    }
    if (token) fetchUserInfo()
  }, [token])

  // creator 여부 비교
  const isCreator = meetingInfo?.creator_id?.trim().toLowerCase() === userInfo.userId?.trim().toLowerCase()

  useEffect(() => {
    console.log("creator_id:", meetingInfo)
    console.log("currentUserId:", userInfo)
    console.log("비교 결과 (소문자, trim):", isCreator)
  }, [meetingInfo, userInfo, isCreator])

  // 회의 상세 정보 불러오기
  useEffect(() => {
    const fetchMeetingDetail = async () => {
      try {
        const res = await axios.get(`/api/meetingData/meetingDetail/${meetingId}?teamId=${teamId}`)
        setMeetingInfo(res.data.meeting)
        setSummaries(res.data.summaries)
      } catch (err) {
        console.error("회의 상세 데이터 조회 오류:", err)
      }
    }
    if (meetingId && teamId) fetchMeetingDetail()
  }, [meetingId, teamId])

  // Kanban 할 일 불러오기
  useEffect(() => {
    const fetchKanbanTasks = async () => {
      try {
        const res = await axios.get(`/api/meetingData/tasks/meeting/${meetingId}`)
        setKanbanTasks(res.data)
      } catch (err) {
        console.error("Kanban tasks 조회 오류:", err)
      }
    }
    if (meetingId) fetchKanbanTasks()
  }, [meetingId])

  // 팀 멤버 불러오기
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await axios.get(`/api/meetingData/tasks/team/${teamId}/members`)
        setTeamMembers(res.data)
      } catch (err) {
        console.error("팀 멤버 조회 오류:", err)
      }
    }
    if (teamId) fetchTeamMembers()
  }, [teamId])

  // 액션 summary_id 찾기
  const actionSummary = summaries.find((s) => s.status === "action")
  const actionSummaryId = actionSummary?.summary_id

  // fulltext 찾기
  const fulltextSummary = summaries.find((s) => s.status === "fulltext")
  const fullTextContent = fulltextSummary?.content || "전체 회의 내용이 없습니다."

  // keypoints 찾기
  const keywordsSummary = summaries.find((s) => s.status === "keywords")
  const keywordsContent = keywordsSummary?.content || "키포인트 추출 내용이 없습니다."
  console.log(keywordsContent)

  // 섹션 접고/펼치기
  const toggleSection = (index) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, collapsed: !section.collapsed } : section)),
    )
  }

  // 회의 삭제
  const handleDeleteMeeting = async () => {
    if (window.confirm("정말로 이 회의를 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/api/meetingData/meetingDetail/meeting/${meetingId}`)
        alert("회의가 삭제되었습니다!")
        // 예: 전체 목록 페이지로 리디렉션
        window.location.href = "/meetings"
      } catch (err) {
        console.error("회의 삭제 오류:", err)
        alert("회의 삭제에 실패했습니다.")
      }
    }
  }

  // 회의 제목 수정
  const handleEditMeeting = async (newTitle) => {
    try {
      const res = await axios.patch(`/api/meetingData/meetingDetail/meeting/${meetingId}`, {
        meetingName: newTitle,
      })
      alert("회의 제목이 수정되었습니다.")
      // 변경 후 다시 불러오기
      const updated = await axios.get(`/api/meetingData/meetingDetail/${meetingId}?teamId=${teamId}`)
      setMeetingInfo(updated.data.meeting)
    } catch (err) {
      console.error("회의 수정 실패:", err)
      alert("회의 제목 수정에 실패했습니다.")
    }
  }

  // 논의 수정
  const handleEditDiscussion = async (newContent) => {
    const discussionSummary = summaries.find((s) => s.status === "discussion")
    if (!discussionSummary) {
      alert("논의 summary가 없습니다.")
      return
    }

    try {
      await axios.put(`/api/meetingData/meetingDetail/summary/${discussionSummary.summary_id}`, {
        content: newContent,
      })
      alert("논의 내용이 수정되었습니다!")

      // 상태 즉시 반영
      setSummaries((prev) =>
        prev.map((s) => (s.summary_id === discussionSummary.summary_id ? { ...s, content: newContent } : s)),
      )
    } catch (err) {
      console.error("논의 수정 오류:", err)
      alert("논의 내용 수정에 실패했습니다.")
    }
  }

  // 요약 수정
  const keypointSummary = summaries.find((s) => s.status === "keypoint")

  const handleEditSummary = async (newContent) => {
    if (!keypointSummary) {
      alert("요약 데이터가 없습니다.")
      return
    }

    try {
      const res = await axios.put(`/api/meetingData/meetingDetail/summary/${keypointSummary.summary_id}`, {
        content: newContent,
      })
      alert("요약 내용이 수정되었습니다!")

      // 상태 업데이트 (즉시 반영)
      setSummaries((prev) =>
        prev.map((s) => (s.summary_id === keypointSummary.summary_id ? { ...s, content: newContent } : s)),
      )
    } catch (err) {
      console.error("요약 수정 실패:", err)
      alert("요약 내용 수정에 실패했습니다.")
    }
  }

  if (!meetingInfo) return <div>로딩 중...</div>

  return (
    <div className="meeting-detail-page">
      <div className="page-card-container">
        <h2 className="meeting-detail-title">회의 기록 상세</h2>
        {sections.map((section, index) => (
          <div key={`${section.type}-${index}`} className="meeting-section-wrapper">
            <div className="section-header">
              <strong>{section.type.toUpperCase()}</strong>
              <button
                className="toggle-btn"
                style={{
                  width: "24px",
                  height: "24px",
                  padding: "0",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "unset",
                }}
                onClick={() => toggleSection(index)}
              >
                {section.collapsed ? "+" : "-"}
              </button>
            </div>

            {!section.collapsed && (
              <>
                {section.type === "info" && (
                  <MeetingInfo
                    meetingName={meetingInfo.title}
                    participants={meetingInfo.members}
                    date={meetingInfo.date}
                    creator={meetingInfo.host}
                    totalDuration={meetingInfo.totalDuration || "00:00:00"}
                    fullText={fullTextContent}
                    isCreator={isCreator}
                    onDelete={handleDeleteMeeting} // Directly call handleDeleteMeeting
                    onEdit={handleEditMeeting}
                  />
                )}
                {section.type === "kanban" && (
                  <>
                    <TeamTaskChart tasks={kanbanTasks} teamMembers={teamMembers} />
                    <KanbanBoard
                      tasks={kanbanTasks}
                      summaryId={actionSummaryId}
                      teamId={meetingInfo.team_id}
                      teamMembers={teamMembers}
                      onTasksUpdate={setKanbanTasks}
                      userId={userInfo.userId}
                    />
                  </>
                )}
                {section.type === "summary" && (
                  <>
                    <WordCloudChart keywords={keywordsContent} />
                    <SummaryBlock
                      content={summaries.find((s) => s.status === "keypoint")?.content}
                      isCreator={isCreator}
                      onEdit={({ content }) => handleEditSummary(content)}
                    />
                  </>
                )}
                {section.type === "discussion" && (
                  <DiscussionList
                    discussionContent={
                      summaries.find((s) => s.status === "discussion")?.content || "논의 내용이 없습니다."
                    }
                    isCreator={isCreator}
                    onEdit={({ content }) => handleEditDiscussion(content)}
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MeetingDetail
