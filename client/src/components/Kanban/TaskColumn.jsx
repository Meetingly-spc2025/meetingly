import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard"

const STATUS_CONFIG = {
  todo: { title: "📋 할 일", emoji: "📋" },
  doing: { title: "⚡ 진행중", emoji: "⚡" },
  done: { title: "✅ 완료", emoji: "✅" },
};

export default function TaskColumn({ status, tasks, onEdit, onDelete, teamMembers }) {
  const config = STATUS_CONFIG[status] || { title: status.toUpperCase(), emoji: "📌" };
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 200,
        minHeight: 300,
        background: "#f1f5f9",
        borderRadius: 8,
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
<h3 style={{ marginBottom: "10px" }}>{config.title}</h3>
      {tasks.map((task) => (
        <TaskCard
          key={task.task_id}
          task={task}
          teamMembers={teamMembers}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
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
  )
}
