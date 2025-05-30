import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import TaskColumn from "./TaskColumn";
import TaskModal from "./TaskModal";
import "../../styles/Task/KanbanBoard.css";

const STATUSES = ["todo", "doing", "done"];

export default function KanbanBoard({ tasks: initialTasks, summaryId, teamId, teamMembers }) {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [modal, setModal] = useState({ open: false, task: null });

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleDragEnd = ({ source, destination, draggableId }) => {
    if (!destination || source.droppableId === destination.droppableId) return;
    const updated = tasks.map((task) =>
      task.task_id === draggableId ? { ...task, status: destination.droppableId } : task
    );
    const moved = updated.find((t) => t.task_id === draggableId);
    setTasks(updated);
    fetch(`/api/tasks/${draggableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(moved),
    });
  };

  const handleAdd = () => setModal({ open: true, task: null });
  const handleEdit = (task) => setModal({ open: true, task });
  const handleDelete = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t.task_id !== id));
  };

  const handleSave = async (task) => {
    const newTask = {
      ...task,
      summary_id: summaryId,
      team_id: teamId,
    };

    if (task.task_id) {
      await fetch(`/api/tasks/${task.task_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      setTasks(tasks.map((t) => (t.task_id === task.task_id ? newTask : t)));
    } else {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const { task_id } = await res.json();
      setTasks([...tasks, { ...newTask, task_id }]);
    }
    setModal({ open: false, task: null });
  };

  return (
    <main style={{ padding: 20 }}>
      <div className="kanban-header">
        <h1>🗂️ 칸반보드</h1>
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
        />
      )}
    </main>
  );
}
