import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import TaskColumn from "./TaskColumn";
import TaskModal from "./TaskModal";
import axios from "axios";
import "../../styles/Task/KanbanBoard.css";

const STATUSES = ["todo", "doing", "done"];

export default function KanbanBoard({ tasks: initialTasks, summaryId, teamId, teamMembers, onTasksUpdate }) {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [modal, setModal] = useState({ open: false, task: null });

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination || source.droppableId === destination.droppableId) return;

    const updated = tasks.map((task) =>
      task.task_id === draggableId ? { ...task, status: destination.droppableId } : task
    );
    const moved = updated.find((t) => t.task_id === draggableId);
    setTasks(updated);

    try {
      await axios.put(`/api/meetingData/tasks/${draggableId}`, moved);
    } catch (err) {
      console.error("드래그 상태 업데이트 오류:", err);
    }
  };

  const handleAdd = () => setModal({ open: true, task: null });
  const handleEdit = (task) => setModal({ open: true, task });

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/meetingData/tasks/${id}`);
      setTasks(tasks.filter((t) => t.task_id !== id));
    } catch (err) {
      console.error("삭제 오류:", err);
    }
  };

  const handleSave = async (task) => {
    // 날짜 문자열 (yyyy-mm-dd)만 받아온다고 가정하고 시간 붙이기
    const createdAt = new Date(`${task.created_at}T09:00:00`);
    const finishedAt = new Date(`${task.finished_at}T18:00:00`);
  
    const newTask = {
      ...task,
      summary_id: summaryId,
      team_id: teamId,
      created_at: createdAt.toISOString(),      // 또는 createdAt.toLocaleString("sv-SE")
      finished_at: finishedAt.toISOString(),    // 또는 finishedAt.toLocaleString("sv-SE")
    };
  
    try {
      if (task.task_id) {
        await axios.put(`/api/meetingData/tasks/${task.task_id}`, newTask);
        const updatedTasks = tasks.map((t) => (t.task_id === task.task_id ? newTask : t));
        setTasks(updatedTasks);
        if (onTasksUpdate) onTasksUpdate(updatedTasks);
      } else {
        const res = await axios.post("/api/meetingData/tasks", newTask);
        const createdTask = { ...newTask, task_id: res.data.task_id };
        const updatedTasks = [...tasks, createdTask];
        setTasks(updatedTasks);
        if (onTasksUpdate) onTasksUpdate(updatedTasks);
      }
      setModal({ open: false, task: null });
    } catch (err) {
      console.error("저장 오류:", err);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <div className="kanban-header">
        <h1>칸반보드</h1>
        <button className="kanban-add-button" onClick={handleAdd}>+ 할 일 추가</button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: 20 }}>
          {STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              teamMembers={teamMembers}
            />
          ))}
        </div>
      </DragDropContext>
      {modal.open && (
        <TaskModal
          task={modal.task}
          onClose={() => setModal({ open: false, task: null })}
          onSave={handleSave}
          teamMembers={teamMembers}
          onTasksUpdate={(updatedTasks) => setKanbanTasks(updatedTasks)} 
        />
      )}
    </main>
  );
}
