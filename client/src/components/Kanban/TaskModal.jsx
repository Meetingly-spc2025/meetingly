import { useState, useEffect } from "react";
import "../../styles/Task/TaskModal.css";

// 할 일 추가/수정 모달 컴포넌트
export default function TaskModal({ task, onClose, onSave, teamMembers = [], origin, userId }) {
  const [content, setContent] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState("todo");
  const [createdAt, setCreatedAt] = useState("");
  const [finishedAt, setFinishedAt] = useState("");

  useEffect(() => {
    if (task) {
      const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

      setContent(task.content);
      setAssigneeId(task.assignee_id || userId || "");
      setStatus(task.status);
      setCreatedAt(task.created_at?.slice(0, 10) || today);
      setFinishedAt(task.finished_at?.slice(0, 10) || today);
    } else {
      // 새 할 일 추가 시에도 기본값 설정
      const today = new Date().toISOString().slice(0, 10);
      setAssigneeId(userId || "");
      setCreatedAt(today);
      setFinishedAt(today);
    }
  }, [task, userId, teamMembers]);

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("할 일 내용을 입력해주세요.");
      return;
    }

    if (createdAt && finishedAt && new Date(finishedAt) < new Date(createdAt)) {
      alert("종료일은 시작일 이후여야 합니다.");
      return;
    }

    const newTask = {
      task_id: task?.task_id,
      content,
      assignee_id: assigneeId || null,
      status,
      created_at: createdAt,
      finished_at: finishedAt,
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
          {Array.isArray(teamMembers) &&
            teamMembers.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.nickname} ({member.name})
              </option>
            ))}
        </select>


        <select
          className="taskmodal-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="todo">TODO</option>
          <option value="doing">DOING</option>
          <option value="done">DONE</option>
        </select>

        <label>시작일</label>
        <input
          type="date"
          className="taskmodal-date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
        />
        <br />
        <label>종료일</label>
        <input
          type="date"
          className="taskmodal-date"
          value={finishedAt}
          onChange={(e) => setFinishedAt(e.target.value)}
        />
        {origin === "calendar" && task?.meeting_id && task?.team_id && (
          <button
            className="taskmodal-goto-detail"
            onClick={() =>
              window.location.href = `/meeting/${task.meeting_id}?teamId=${task.team_id}`
            }
          >
            📎 회의 상세페이지로 이동
          </button>
        )}

        <div className="taskmodal-buttons">
          <button onClick={handleSubmit}>저장</button>
          <button onClick={onClose} className="taskmodal-cancel">취소</button>
        </div>
      </div>
    </div>

  );
}
