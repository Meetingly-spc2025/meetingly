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
    <div className="taskmodal-overlay">
      <div className="taskmodal-container">
        <h3>{task ? "할 일 수정" : "할 일 추가"}</h3>
        <textarea
          className="taskmodal-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="할 일 내용"
        />
        <input
          className="taskmodal-input"
          type="text"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          placeholder="담당자 ID"
        />
        <select
          className="taskmodal-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="todo">TODO</option>
          <option value="doing">DOING</option>
          <option value="done">DONE</option>
        </select>
        <div className="taskmodal-buttons">
          <button onClick={handleSubmit}>저장</button>
          <button onClick={onClose} className="taskmodal-cancel">취소</button>
        </div>
      </div>
    </div>
  );
}
