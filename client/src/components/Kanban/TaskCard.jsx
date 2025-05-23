import { Draggable } from "react-beautiful-dnd";

export default function TaskCard({ task, index, onEdit, onDelete }) {
  return (
    <Draggable draggableId={String(task.task_id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps} // 전체 카드가 드래그 가능하도록 유지
          style={{
            background: snapshot.isDragging ? "#f0f0ff" : "white",
            border: "1px solid #ccc",
            marginBottom: 10,
            padding: 10,
            borderRadius: 6,
            boxShadow: snapshot.isDragging ? "0 0 10px rgba(0,0,0,0.2)" : "none",
            ...provided.draggableProps.style,
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 5 }}>{task.content}</div>
          <small style={{ color: "#666" }}>
            담당자: {task.assignee_id || "없음"}
          </small>
          <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => onEdit(task)}
              style={{ fontSize: 12 }}
            >
              ✏️
            </button>
            <button
              type="button"
              onClick={() => onDelete(task.task_id)}
              style={{ fontSize: 12 }}
            >
              🗑
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
