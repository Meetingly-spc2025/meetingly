import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import TaskColumn from "./TaskColumn";
import TaskModal from "./TaskModal";
import axios from "axios";
import "../../styles/Task/KanbanBoard.css";

// 컬럼 상태를 고정 배열로 정의 (todo, doing, done)
const STATUSES = ["todo", "doing", "done"];

export default function KanbanBoard({ tasks: initialTasks, summaryId, teamId, teamMembers }) {
  // tasks 상태: 현재 보드에 표시될 할 일 목록
  const [tasks, setTasks] = useState(initialTasks || []);
  // modal 상태: 모달 열림/닫힘 여부 및 편집할 task 정보
  const [modal, setModal] = useState({ open: false, task: null });

  // props로 받은 initialTasks가 변경되면 tasks를 업데이트
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // 드래그 앤 드롭이 끝났을 때 실행되는 함수
  const handleDragEnd = async ({ source, destination, draggableId }) => {
    // 목적지가 없거나 같은 컬럼으로의 이동이면 아무 작업도 안 함
    if (!destination || source.droppableId === destination.droppableId) return;

    // 드래그된 task의 status를 새로운 컬럼으로 업데이트
    const updated = tasks.map((task) =>
      task.task_id === draggableId ? { ...task, status: destination.droppableId } : task
    );
    const moved = updated.find((t) => t.task_id === draggableId);
    setTasks(updated); // UI에서 즉시 반영

    // 백엔드에 업데이트 요청
    try {
      await axios.put(`/api/tasks/${draggableId}`, moved);
    } catch (err) {
      console.error("드래그 상태 업데이트 오류:", err);
    }
  };

  // + 할 일 추가 버튼 클릭 → 새 task 모달 열기
  const handleAdd = () => setModal({ open: true, task: null });

  // task 수정 버튼 클릭 → 수정할 task 정보를 모달로 넘김
  const handleEdit = (task) => setModal({ open: true, task });

  // task 삭제 버튼 클릭
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`); // 백엔드에서 삭제
      setTasks(tasks.filter((t) => t.task_id !== id)); // UI에서도 삭제
    } catch (err) {
      console.error("삭제 오류:", err);
    }
  };

  // 모달에서 저장 버튼 클릭 (새로운 task 추가 or 기존 task 수정)
  const handleSave = async (task) => {
    // 백엔드에 전달할 데이터 (summary_id, team_id 포함)
    const newTask = {
      ...task,
      summary_id: summaryId,
      team_id: teamId,
    };

    try {
      if (task.task_id) {
        // 기존 task 수정
        await axios.put(`/api/tasks/${task.task_id}`, newTask);
        setTasks(tasks.map((t) => (t.task_id === task.task_id ? newTask : t)));
      } else {
        // 새로운 task 추가
        const res = await axios.post("/api/tasks", newTask);
        const { task_id } = res.data;
        setTasks([...tasks, { ...newTask, task_id }]);
      }
      // 모달 닫기
      setModal({ open: false, task: null });
    } catch (err) {
      console.error("저장 오류:", err);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      {/* 제목과 +할 일 추가 버튼 */}
      <div className="kanban-header">
        <h1>칸반보드</h1>
        <button className="kanban-add-button" onClick={handleAdd}>+ 할 일 추가</button>
      </div>

      {/* DragDropContext로 드래그 영역을 감싸줌 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: 20 }}>
          {STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)} // status별로 필터링
              onEdit={handleEdit}
              onDelete={handleDelete}
              teamMembers={teamMembers} // TaskColumn에서 담당자 표시 가능
            />
          ))}
        </div>
      </DragDropContext>

      {/* 모달: 열려있으면 TaskModal 렌더링 */}
      {modal.open && (
        <TaskModal
          task={modal.task}
          onClose={() => setModal({ open: false, task: null })}
          onSave={handleSave}
          teamMembers={teamMembers}
        />
      )}
    </main>
  );
}
