import { Draggable } from "react-beautiful-dnd";

export default function TaskCard({ task, index, onEdit, onDelete, teamMembers }) {
  // 담당자 닉네임 (없으면 “없음” 표시)
  const assignee = teamMembers?.find((m) => m.user_id === task.assignee_id);
  const assigneeName = assignee ? `${assignee.nickname} (${assignee.name})` : "없음";

  return (
    <Draggable draggableId={String(task.task_id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`taskcard-container ${snapshot.isDragging ? "taskcard-dragging" : ""}`}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <div className="taskcard-content">{task.content}</div>
          <small className="taskcard-assignee">
            담당자: {assigneeName}
          </small>
          <div className="taskcard-buttons">
            <button type="button" onClick={() => onEdit(task)}>✏️</button>
            <button type="button" onClick={() => onDelete(task.task_id)}>🗑</button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
