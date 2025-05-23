import { useState, useEffect } from "react";

export default function TaskModal({ task, onClose, onSave }) {
  const [content, setContent] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState("todo");

  useEffect(() => {
    if (task) {
      setContent(task.content);
      setAssigneeId(task.assignee_id);
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = () => {
    const newTask = {
      task_id: task?.task_id,
      content,
      assignee_id: assigneeId,
      status,
    };
    onSave(newTask);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      background: "rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "white", padding: 20, width: 300 }}>
        <h3>{task ? "할 일 수정" : "할 일 추가"}</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="할 일 내용"
          style={{ width: "100%", height: 80 }}
        />
        <input
          type="text"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          placeholder="담당자 ID"
          style={{ width: "100%", marginTop: 5 }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ width: "100%", marginTop: 5 }}
        >
          <option value="todo">TODO</option>
          <option value="doing">DOING</option>
          <option value="done">DONE</option>
        </select>
        <div style={{ marginTop: 10 }}>
          <button onClick={handleSubmit}>저장</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>취소</button>
        </div>
      </div>
    </div>
  );
}
