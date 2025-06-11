"use client"

import { Draggable } from "@hello-pangea/dnd"

export default function TaskCard({ task, index, onEdit, onDelete, teamMembers }) {
  const assignee = teamMembers?.find((m) => m.user_id === task.assignee_id)
  const assigneeName = assignee ? `${assignee.nickname} (${assignee.name})` : "미배정"

  const formatDate = (dateString) => dateString?.slice(0, 10) || "미정"

  return (
    <Draggable draggableId={String(task.task_id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`taskcard-container ${snapshot.isDragging ? "taskcard-dragging" : ""}`}
          style={{ ...provided.draggableProps.style }}
        >
          <div className="taskcard-content">{task.content}</div>
          <div className="taskcard-assignee">{assigneeName}</div>
          <div className="taskcard-dates">
            {formatDate(task.created_at)} ~ {formatDate(task.finished_at)}
          </div>
          <div className="taskcard-buttons">
            <button
              type="button"
              className="kanban-btn kanban-btn-xs kanban-btn-ghost"
              onClick={() => onEdit(task)}
              title="수정"
            >
              ✏️
            </button>
            <button
              type="button"
              className="kanban-btn kanban-btn-xs kanban-btn-danger"
              onClick={() => onDelete(task.task_id)}
              title="삭제"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </Draggable>
  )
}
