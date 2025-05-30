import { useState, useEffect } from "react";

export default function TaskModal({ task, onClose, onSave, teamMembers }) {
  const [content, setContent] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState("todo");

  // ✅ 드롭다운에서 보여질 assignee 이름/닉네임 표시용 (선택된 멤버!)
  const [assigneeNickname, setAssigneeNickname] = useState("");

  useEffect(() => {
    if (task) {
      setContent(task.content);
      setAssigneeId(task.assignee_id || ""); // 실제 저장되는 값 (user_id)
      setStatus(task.status);

      // 👉 task의 assignee_id에 맞는 팀 멤버 닉네임 찾기
      const selectedMember = teamMembers.find((m) => m.user_id === task.assignee_id);
      if (selectedMember) {
        setAssigneeNickname(`${selectedMember.nickname} (${selectedMember.name})`);
      } else {
        setAssigneeNickname("");
      }
    }
  }, [task, teamMembers]);

  const handleSubmit = () => {
    const newTask = {
      task_id: task?.task_id,
      content,
      assignee_id: assigneeId || null, // null 허용
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

        <select
          className="taskmodal-select"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">담당자 선택</option>
          {teamMembers.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {member.nickname} ({member.name})
            </option>
          ))}
        </select>

        {/* 👉 선택된 담당자 이름/닉네임 표시 */}
        {assigneeNickname && (
          <div style={{ marginTop: "8px", fontSize: "0.9rem", color: "#888" }}>
            현재 담당자: {assigneeNickname}
          </div>
        )}

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
