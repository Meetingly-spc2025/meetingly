import { Draggable } from "react-beautiful-dnd";

export default function TaskCard({ task, index, onEdit, onDelete }) {
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
            담당자: {task.assignee_id || "없음"}
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
