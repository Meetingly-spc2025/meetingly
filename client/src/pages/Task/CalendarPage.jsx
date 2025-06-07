// CalendarPage.jsx
import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import "../../styles/Task/CalendarPage.css"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import CalendarTaskCard from "../../components/Taskboard/CalendarTaskCard.jsx"
import TaskModal from "../../components/Kanban/TaskModal.jsx"

const CalendarPage = () => {
  const [meetingsByDate, setMeetingsByDate] = useState({})
  const [tasksByDate, setTasksByDate] = useState({})
  const [showingTasksOnly, setShowingTasksOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [teamId, setTeamId] = useState(null)
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])

  const openTaskModal = (task) => {
    const matchedAssignee = teamMembers.find(member => member.user_id === task.assignee_id);

    // assignee_id가 없으면 userId를 기본값으로 설정
    const defaultAssigneeId = task.assignee_id || userId;

    setSelectedTask({
      ...task,
      assignee_id: matchedAssignee?.user_id || defaultAssigneeId,
      assignee: matchedAssignee || teamMembers.find(m => m.user_id === defaultAssigneeId) || null,
    });

    setIsTaskModalOpen(true);
  };


  const closeTaskModal = () => {
    setSelectedTask(null)
    setIsTaskModalOpen(false)
  }

  const handleTaskSave = async (updatedTask) => {
    try {
      await axios.put(`/api/meetingData/tasks/${updatedTask.task_id}`, updatedTask)
      alert("작업이 성공적으로 저장되었습니다.")
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1
      fetchTasksForMonth(year, month)
      setShowingTasksOnly(true)
    } catch (err) {
      console.error("작업 저장 실패:", err)
      alert("작업 저장 중 오류가 발생했습니다.")
    } finally {
      closeTaskModal()
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
      } finally {
        setLoading(false)
      }
    }

    fetchUserTeam()
  }, [navigate])

  const fetchMeetingsForMonth = async (year, month) => {
    if (!teamId) return
    try {
      const res = await axios.get(`/api/meetingData/meetinglists/task/${teamId}/by-month?year=${year}&month=${month}`)
      const meetings = res.data.meetings
      const grouped = meetings.reduce((acc, meeting) => {
        const dateKey = new Date(meeting.date).toLocaleDateString("sv-SE")
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(meeting)
        return acc
      }, {})
      setMeetingsByDate(grouped)
    } catch (err) {
      console.error("월간 회의 목록 불러오기 오류:", err)
    }
  }

  const fetchTasksForMonth = async (year, month) => {
    if (!userId || teamMembers.length === 0) return
    try {
      const res = await axios.get(`/api/meetingData/tasks/by-user/${userId}/by-month?year=${year}&month=${month}`)
      const tasks = res.data.tasks

      const tasksWithAssignees = tasks.map(task => {
        const fallbackAssigneeId = task.assignee_id || userId;
        const assignee = teamMembers.find(member => member.user_id === fallbackAssigneeId);
        return {
          ...task,
          assignee_id: fallbackAssigneeId,
          assignee,
          meeting_id: task.meeting_id,
          team_id: teamId
        };
      });

      const grouped = {}
      tasksWithAssignees.forEach((task) => {
        const start = new Date(task.created_at)
        const end = new Date(task.finished_at)
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateKey = d.toLocaleDateString("sv-SE")
          if (!grouped[dateKey]) grouped[dateKey] = []
          grouped[dateKey].push(task)
        }
      })
      setTasksByDate(grouped)
    } catch (err) {
      console.error("월간 개인 할 일 목록 불러오기 오류:", err)
    }
  }

  useEffect(() => {
    if (!teamId || !userId || teamMembers.length === 0) return
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    fetchMeetingsForMonth(year, month)
    fetchTasksForMonth(year, month)
  }, [teamId, userId, teamMembers])

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    const year = activeStartDate.getFullYear()
    const month = activeStartDate.getMonth() + 1
    fetchMeetingsForMonth(year, month)
    fetchTasksForMonth(year, month)
  }

  if (loading) return <div>로딩 중...</div>

  return (
    <div className="calendarpage-container">
      <h2 className="calendarpage-title">Meetingly Calendar</h2>
      <div className="calendar-toggle-buttons">
        <button className={`toggle-btn ${!showingTasksOnly ? "active" : ""}`} onClick={() => setShowingTasksOnly(false)}>
          📅 팀 회의
        </button>
        <button className={`toggle-btn ${showingTasksOnly ? "active" : ""}`} onClick={() => setShowingTasksOnly(true)}>
          ✅ 내 할 일
        </button>
      </div>
      <div className="calendar-wrapper">
        <Calendar
          onActiveStartDateChange={handleActiveStartDateChange}
          tileClassName={({ date }) => {
            const key = date.toISOString().split("T")[0]
            return showingTasksOnly && tasksByDate[key] ? "task-highlight" : null
          }}
          tileContent={({ date }) => {
            const formattedDate = date.toLocaleDateString("sv-SE")
            
            if (showingTasksOnly) {
              const tasks = tasksByDate[formattedDate]
              if (!tasks) return null

              const uniqueTasks = tasks.reduce((acc, task) => {
                if (!acc[task.task_id]) {
                  acc[task.task_id] = task
                }
                return acc
              }, {})

              return (
                <div className="calendar-tile-tasks">
                  {Object.values(uniqueTasks).map((t) => {
                    const taskStart = new Date(t.created_at).toISOString().split("T")[0]
                    const taskEnd = new Date(t.finished_at).toISOString().split("T")[0]
                    const isStartDate = formattedDate === taskStart
                    const isEndDate = formattedDate === taskEnd
                    const isContinuation = !isStartDate && !isEndDate
                    const isTruncated = !isStartDate && formattedDate !== taskEnd

                    return (
                      <CalendarTaskCard
                        key={`${t.task_id}-${formattedDate}`}
                        task={t}
                        isStartDate={isStartDate}
                        isEndDate={isEndDate}
                        isContinuation={isContinuation}
                        isTruncated={isTruncated}
                        onClick={() => openTaskModal(t)}
                      />
                    )
                  })}
                </div>
              )
            } else {
              const meetings = meetingsByDate[formattedDate]
              if (!meetings) return null
              return (
                <div className="calendar-tile-meetings">
                  {meetings.map((m) => (
                    <div
                      key={m.meeting_id}
                      className="calendar-tile-meeting-card"
                      onClick={() => navigate(`/meeting/${m.meeting_id}?teamId=${teamId}`)}
                    >
                      <span className="calendar-tile-meeting-title">{m.title}</span>
                    </div>
                  ))}
                </div>
              )
            }
          }}
        />
      </div>
      {isTaskModalOpen && selectedTask && (
        <TaskModal
          task={selectedTask}
          teamMembers={teamMembers}
          userId={userId}
          onClose={closeTaskModal}
          onSave={handleTaskSave}
          origin="calendar"
        />
      )}
    </div>
  )
}

export default CalendarPage
