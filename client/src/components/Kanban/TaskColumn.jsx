import { Droppable } from "@hello-pangea/dnd"
import TaskCard from "./TaskCard"

const STATUS_CONFIG = {
  todo: { title: "📋 할 일", emoji: "📋" },
  doing: { title: "⚡ 진행중", emoji: "⚡" },
  done: { title: "✅ 완료", emoji: "✅" },
}

export default function TaskColumn({ status, tasks, onEdit, onDelete, teamMembers }) {
  const config = STATUS_CONFIG[status] || { title: status.toUpperCase(), emoji: "📌" }

  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`taskcolumn-container ${snapshot.isDraggingOver ? "drag-over" : ""}`}
        >
          <h3 className="taskcolumn-title">
            {config.title}
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.75rem",
                background: "#f1f5f9",
                padding: "2px 8px",
                borderRadius: "12px",
                color: "#64748b",
                fontWeight: "500",
              }}
            >
              {tasks.length}
            </span>
          </h3>
          {tasks.map((task, index) => (
            <TaskCard
              key={task.task_id}
              task={task}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              teamMembers={teamMembers}
            />
          ))}
          {provided.placeholder}
          {tasks.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "0.875rem",
                fontStyle: "italic",
                padding: "40px 20px",
                border: "2px dashed #e2e8f0",
                borderRadius: "8px",
                margin: "8px 0",
              }}
            >
              {status === "todo" && "새로운 할 일을 추가해보세요"}
              {status === "doing" && "진행중인 작업이 없습니다"}
              {status === "done" && "완료된 작업이 없습니다"}
            </div>
          )}
        </div>
      )}
    </Droppable>
  )
}
