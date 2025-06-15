"use client"

import { useState, useEffect } from "react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import TaskColumn from "./TaskColumn"
import TaskModal from "./TaskModal"
import axios from "axios"
import "../../styles/Task/KanbanBoard.css"

const STATUSES = ["todo", "doing", "done"]

export default function KanbanBoard({ tasks: initialTasks, summaryId, teamId, teamMembers, onTasksUpdate, userId }) {
  const [tasks, setTasks] = useState(initialTasks || [])
  const [modal, setModal] = useState({ open: false, task: null })

  useEffect(() => {
    setTasks(initialTasks || [])
  }, [initialTasks])

  // status 변경 시 DB에도 저장
  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find((t) => t.task_id === taskId)
    if (!task) return
    const updatedTask = { ...task, status: newStatus }
    try {
      await axios.put(`/api/meetingData/tasks/${taskId}`, updatedTask)
      const newTasks = tasks.map((t) => t.task_id === taskId ? updatedTask : t)
      setTasks(newTasks)
      if (onTasksUpdate) onTasksUpdate(newTasks)
    } catch (err) {
      alert('상태 변경 저장 실패')
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over) return
    if (active.id === over.id) return

    const activeTask = tasks.find((t) => t.task_id === active.id)

    if (STATUSES.includes(over.id)) {
      // 컬럼 이동: DB에도 저장
      handleStatusChange(active.id, over.id)
      return
    }

    const overTask = tasks.find((t) => t.task_id === over.id)
    if (!activeTask || !overTask) return

    if (activeTask.status === overTask.status) {
      const filtered = tasks.filter((t) => t.status === activeTask.status)
      const oldIndex = filtered.findIndex((t) => t.task_id === active.id)
      const newIndex = filtered.findIndex((t) => t.task_id === over.id)
      const moved = arrayMove(filtered, oldIndex, newIndex)
      const newTasks = tasks
        .filter((t) => t.status !== activeTask.status)
        .concat(moved)
      setTasks(newTasks)
      if (onTasksUpdate) onTasksUpdate(newTasks)
    } else {
      // 다른 컬럼의 특정 위치로 이동: status 변경 + DB 저장
      handleStatusChange(active.id, overTask.status)
    }
  }

  const handleAdd = () => setModal({ open: true, task: null })
  const handleEdit = (task) => setModal({ open: true, task })

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/meetingData/tasks/${id}`)
      setTasks(tasks.filter((t) => t.task_id !== id))
    } catch (err) {
      console.error("삭제 오류:", err)
    }
  }

  const handleSave = async (task) => {
    const createdAt = new Date(`${task.created_at}T09:00:00`)
    const finishedAt = new Date(`${task.finished_at}T18:00:00`)

    const newTask = {
      ...task,
      summary_id: summaryId,
      team_id: teamId,
      created_at: createdAt.toISOString(),
      finished_at: finishedAt.toISOString(),
    }

    try {
      if (task.task_id) {
        await axios.put(`/api/meetingData/tasks/${task.task_id}`, newTask)
        const updatedTasks = tasks.map((t) => (t.task_id === task.task_id ? newTask : t))
        setTasks(updatedTasks)
        if (onTasksUpdate) onTasksUpdate(updatedTasks)
      } else {
        const res = await axios.post("/api/meetingData/tasks", newTask)
        const createdTask = { ...newTask, task_id: res.data.task_id }
        const updatedTasks = [...tasks, createdTask]
        setTasks(updatedTasks)
        if (onTasksUpdate) onTasksUpdate(updatedTasks)
      }
      setModal({ open: false, task: null })
    } catch (err) {
      console.error("저장 오류:", err)
    }
  }

  return (
    <div className="kanban-board-wrapper">
      <div className="kanban-header">
        <h1>✨ 칸반보드</h1>
        <button className="kanban-btn kanban-btn-primary" onClick={handleAdd}>
          <span>+</span>할 일 추가
        </button>
      </div>
      <div style={{ display: "flex", gap: 24, padding: 24 }} className="kanban-grid">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {STATUSES.map((status) => (
            <SortableContext
              key={status}
              items={tasks.filter((t) => t.status === status).map((t) => t.task_id)}
              strategy={verticalListSortingStrategy}
            >
              <TaskColumn
                status={status}
                tasks={tasks.filter((t) => t.status === status)}
                teamMembers={teamMembers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                summaryId={summaryId}
                teamId={teamId}
                userId={userId}
                onTasksUpdate={onTasksUpdate}
              />
            </SortableContext>
          ))}
        </DndContext>
      </div>
      {modal.open && (
        <TaskModal
          task={modal.task}
          onClose={() => setModal({ open: false, task: null })}
          onSave={handleSave}
          teamMembers={teamMembers}
          userId={userId}
          onTasksUpdate={onTasksUpdate}
        />
      )}
    </div>
  )
}
