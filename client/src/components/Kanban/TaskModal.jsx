import { useState, useEffect } from "react";

// 할 일 추가/수정 모달 컴포넌트
export default function TaskModal({ task, onClose, onSave, teamMembers }) {
  // 모달 내부 상태: 내용, 담당자, 상태
  const [content, setContent] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [status, setStatus] = useState("todo");

  // 수정 모드일 경우, 기존 task 데이터를 초기화
  useEffect(() => {
    if (task) {
      setContent(task.content);
      setAssigneeId(task.assignee_id || "");
      setStatus(task.status);
    }
  }, [task]);

  // 저장 버튼 클릭 시 호출되는 함수
  const handleSubmit = () => {
    const newTask = {
      task_id: task?.task_id,  // 수정일 경우 id 포함, 추가일 경우 undefined
      content,
      assignee_id: assigneeId || null, // 담당자가 없으면 null 처리
      status,
    };
    onSave(newTask); // 부모 컴포넌트로 저장 요청
  };

  return (
    // 모달 배경
    <div className="taskmodal-overlay">
      {/* 모달 내부 콘텐츠 */}
      <div className="taskmodal-container">
        {/* 모달 제목 */}
        <h3>{task ? "할 일 수정" : "할 일 추가"}</h3>

        {/* 할 일 내용 입력 */}
        <textarea
          className="taskmodal-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="할 일 내용"
        />

        {/* 담당자 선택 */}
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

        {/* 상태 선택 */}
        <select
          className="taskmodal-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="todo">TODO</option>
          <option value="doing">DOING</option>
          <option value="done">DONE</option>
        </select>

        {/* 버튼 영역 */}
        <div className="taskmodal-buttons">
          <button onClick={handleSubmit}>저장</button>
          <button onClick={onClose} className="taskmodal-cancel">취소</button>
        </div>
      </div>
    </div>
  );
}
