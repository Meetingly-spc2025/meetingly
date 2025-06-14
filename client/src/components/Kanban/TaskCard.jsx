"use client"

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task, teamMembers, onEdit, onDelete, userId }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.task_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "default",
  };

  const assignee = teamMembers?.find((m) => m.user_id === task.assignee_id);
  const assigneeName = assignee ? `${assignee.nickname} (${assignee.name})` : "미배정";
  const formatDate = (dateString) => dateString?.slice(0, 10) || "미정";

  return (
    <div ref={setNodeRef} className="taskcard-container" style={style} {...attributes}>
      <div {...listeners} className="taskcard-content" style={{ cursor: "grab" }}>
        {task.content}
      </div>
      <div {...listeners} className="taskcard-assignee">{assigneeName}</div>
      <div {...listeners} className="taskcard-dates">{formatDate(task.created_at)} ~ {formatDate(task.finished_at)}</div>
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
  );
}
