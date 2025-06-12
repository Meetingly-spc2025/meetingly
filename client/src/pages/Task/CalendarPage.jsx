"use client"

import { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import TaskModal from "../../components/Kanban/TaskModal.jsx"
import "../../styles/Task/CalendarPage.css"

const CalendarPage = () => {
  const [allTaskEvents, setAllTaskEvents] = useState([])
  const [allMeetingEvents, setAllMeetingEvents] = useState([])
  const [displayEvents, setDisplayEvents] = useState([])
  const [showingTasksOnly, setShowingTasksOnly] = useState(false)
  const [teamId, setTeamId] = useState(null)
  const [userId, setUserId] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const navigate = useNavigate()

  // 테마에 맞는 파스텔 색상 배열
  const pastelColors = [
    { bg: "#ffecb3", text: "#e65100" }, // 노랑
    { bg: "#e1bee7", text: "#6a1b9a" }, // 보라
    { bg: "#bbdefb", text: "#0d47a1" }, // 파랑
    { bg: "#c8e6c9", text: "#1b5e20" }, // 초록
    { bg: "#ffcdd2", text: "#b71c1c" }, // 빨강
    { bg: "#b3e5fc", text: "#01579b" }, // 하늘
    { bg: "#f8bbd0", text: "#880e4f" }, // 분홍
    { bg: "#d7ccc8", text: "#3e2723" }, // 갈색
    { bg: "#dcedc8", text: "#33691e" }, // 연두
    { bg: "#cfd8dc", text: "#263238" }, // 회색
  ]

  // 안전한 색상 선택 함수
  const getTaskColor = (taskId) => {
    try {
      // 기본값 설정
      let colorIndex = 0

      // taskId가 존재하는지 확인
      if (taskId) {
        // 문자열을 숫자로 변환하되, 실패하면 0 사용
        const taskIdStr = String(taskId)
        let numericId = 0

        // 문자열의 각 문자 코드를 합산하여 숫자 생성
        for (let i = 0; i < taskIdStr.length; i++) {
          numericId += taskIdStr.charCodeAt(i)
        }

        colorIndex = numericId % pastelColors.length
      }

      // 인덱스가 유효한지 확인
      if (colorIndex < 0 || colorIndex >= pastelColors.length) {
        colorIndex = 0
      }

      return pastelColors[colorIndex]
    } catch (error) {
      console.warn("색상 선택 중 오류:", error)
      // 오류 발생 시 첫 번째 색상 반환
      return pastelColors[0]
    }
  }

  useEffect(() => {
    const fetchUserTeam = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("/api/users/jwtauth", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const user = res.data.user
        if (user.teamId) {
          setTeamId(user.teamId)
          setUserId(user.id)
          const memberRes = await axios.get(`/api/meetingData/tasks/team/${user.teamId}/members`)
          setTeamMembers(memberRes.data)
        } else {
          navigate("/team/join")
        }
      } catch (err) {
        console.error("유저 팀 정보 확인 실패:", err)
        alert("로그인이 필요합니다.")
        navigate("/login")
      }
    }
    fetchUserTeam()
  }, [navigate])

  // ✅ 유저 정보, 팀 멤버 정보, 날짜 정보가 모두 준비되면 자동으로 fetch 실행
  useEffect(() => {
    if (teamId && userId && teamMembers.length > 0 && currentYear && currentMonth) {
      fetchEvents(currentYear, currentMonth)
    }
  }, [teamId, userId, teamMembers, currentYear, currentMonth])

  const fetchEvents = async (year, month) => {
    try {
      const [taskRes, meetingRes] = await Promise.all([
        axios.get(`/api/meetingData/tasks/by-user/${userId}/by-month?year=${year}&month=${month}`),
        axios.get(`/api/meetingData/meetinglists/task/${teamId}/by-month?year=${year}&month=${month}`),
      ])

      // 태스크 이벤트 생성 - 직접 색상과 제목 설정
      const taskEvents = taskRes.data.tasks.map((task) => {
        const color = getTaskColor(task.task_id)
        return {
          id: task.task_id,
          title: task.content, // 제목 직접 설정
          start: task.created_at,
          end: addOneDay(task.finished_at),
          backgroundColor: color.bg, // 배경색 직접 설정
          borderColor: color.bg,
          textColor: color.text, // 텍스트 색상 직접 설정
          extendedProps: {
            type: "task",
            task,
          },
        }
      })

      const meetingEvents = meetingRes.data.meetings.map((meeting) => ({
        id: meeting.meeting_id,
        title: `📅 ${meeting.title}`,
        start: meeting.date,
        backgroundColor: "#bbdefb",
        borderColor: "#90caf9",
        textColor: "#1976d2",
        allDay: true,
        extendedProps: {
          type: "meeting",
          meeting,
        },
      }))

      setAllTaskEvents(taskEvents)
      setAllMeetingEvents(meetingEvents)
      setDisplayEvents(showingTasksOnly ? taskEvents : meetingEvents)
    } catch (err) {
      console.error("이벤트 불러오기 실패:", err)
    }
  }

  const addOneDay = (dateStr) => {
    const date = new Date(dateStr)
    date.setDate(date.getDate() + 1)
    return date.toISOString().split("T")[0]
  }

  const handleEventClick = (info) => {
    const { type, task, meeting } = info.event.extendedProps
    if (type === "task") {
      const matchedAssignee = teamMembers.find((m) => m.user_id === task.assignee_id)
      setSelectedTask({
        ...task,
        assignee: matchedAssignee,
      })
      setIsTaskModalOpen(true)
    } else if (type === "meeting") {
      navigate(`/meeting/${meeting.meeting_id}?teamId=${teamId}`)
    }
  }

  const handleDatesSet = (arg) => {
    const date = arg.start
    setCurrentYear(date.getFullYear())
    setCurrentMonth(date.getMonth() + 1)
  }

  const handleTaskSave = async (updatedTask) => {
    try {
      await axios.put(`/api/meetingData/tasks/${updatedTask.task_id}`, updatedTask)
      alert("작업이 저장되었습니다.")
      if (currentYear && currentMonth) {
        fetchEvents(currentYear, currentMonth)
      }
    } catch (err) {
      console.error("작업 저장 실패:", err)
      alert("작업 저장 중 오류 발생")
    } finally {
      setIsTaskModalOpen(false)
      setSelectedTask(null)
    }
  }

  const handleToggle = (mode) => {
    const isTask = mode === "task"
    setShowingTasksOnly(isTask)
    setDisplayEvents(isTask ? allTaskEvents : allMeetingEvents)
  }

  return (
    <div className="calendarpage-container">
      <div className="calendar-header-card">
        <h2 className="calendarpage-title">Meetingly Calendar</h2>
        <div className="calendar-toggle-buttons">
          <button
            className={`calendar-toggle-btn ${!showingTasksOnly ? "active" : ""}`}
            onClick={() => handleToggle("meeting")}
          >
            📅 팀 회의
          </button>
          <button
            className={`calendar-toggle-btn ${showingTasksOnly ? "active" : ""}`}
            onClick={() => handleToggle("task")}
          >
            ✅ 내 할 일
          </button>
        </div>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={displayEvents}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        locale="ko"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        dayMaxEventRows={3}
        aspectRatio={1.5}
      />
      {isTaskModalOpen && selectedTask && (
        <TaskModal
          task={selectedTask}
          teamMembers={teamMembers}
          userId={userId}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleTaskSave}
          origin="calendar"
        />
      )}
    </div>
  )
}

export default CalendarPage
