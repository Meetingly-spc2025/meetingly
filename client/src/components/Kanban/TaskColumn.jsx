// react-beautiful-dnd의 Droppable: 드래그 가능한 영역 정의
import { Droppable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";

// 각 컬럼 컴포넌트
export default function TaskColumn({ status, tasks, onEdit, onDelete, teamMembers }) {
  return (
    // Droppable으로 컬럼 전체를 감싸고 droppableId를 status로 지정
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          // 드롭 가능한 영역의 참조(ref)를 지정 (필수)
          ref={provided.innerRef}
          // 드래그 앤 드롭 동작을 위한 기본 속성 부여
          {...provided.droppableProps}
          className="taskcolumn-container"
        >
          {/* 컬럼 제목 */}
          <h3 className="taskcolumn-title">{status.toUpperCase()}</h3>

          {/* 할 일 카드 목록 (status별로 필터링된 tasks) */}
          {tasks.map((task, index) => (
            <TaskCard
              key={task.task_id} // key로 각 task의 id
              task={task} // 개별 task 정보 전달
              index={index} // Draggable의 index로 사용
              onEdit={onEdit} // 수정 핸들러
              onDelete={onDelete} // 삭제 핸들러
              teamMembers={teamMembers} // 담당자 정보 전달
            />
          ))}

          {/* react-beautiful-dnd의 placeholder: 드래그 중 UI 깨짐 방지 */}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
