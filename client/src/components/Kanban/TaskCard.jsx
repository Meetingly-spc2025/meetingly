// react-beautiful-dnd의 Droppable: 드래그 가능한 영역 정의
import { Draggable } from "react-beautiful-dnd";

export default function TaskCard({ task, index, onEdit, onDelete, teamMembers }) {
  // 팀 멤버 목록에서 담당자 정보 찾기 (user_id 비교)
  const assignee = teamMembers?.find((m) => m.user_id === task.assignee_id);
  // 담당자 이름 표시 (없으면 “없음”으로)
  const assigneeName = assignee ? `${assignee.nickname} (${assignee.name})` : "없음";

  return (
    // react-beautiful-dnd의 Draggable로 카드 감싸기
    <Draggable draggableId={String(task.task_id)} index={index}>
      {(provided, snapshot) => (
        <div
          // Drag & Drop을 위한 필수 ref
          ref={provided.innerRef}
          // 드래그 가능한 속성과 핸들 속성
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          // CSS 클래스명 (드래그 중 여부에 따라 클래스 추가)
          className={`taskcard-container ${snapshot.isDragging ? "taskcard-dragging" : ""}`}
          // react-beautiful-dnd가 동적으로 부여하는 스타일 추가
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {/* 할 일 내용 */}
          <div className="taskcard-content">{task.content}</div>

          {/* 담당자 이름 */}
          <small className="taskcard-assignee">
            담당자: {assigneeName}
          </small>

          {/* 수정/삭제 버튼 */}
          <div className="taskcard-buttons">
            <button type="button" onClick={() => onEdit(task)}>✏️</button>
            <button type="button" onClick={() => onDelete(task.task_id)}>🗑</button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
