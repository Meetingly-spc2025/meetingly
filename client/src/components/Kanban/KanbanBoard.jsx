import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import TaskColumn from "./TaskColumn";
import TaskModal from "./TaskModal";

const STATUSES = ["todo", "doing", "done"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [modal, setModal] = useState({ open: false, task: null });
  const [summaryId, setSummaryId] = useState("summary-001");

  useEffect(() => {
    fetch(`http://localhost:3001/tasks/${summaryId}`)
      .then(res => res.json())
      .then(data => setTasks(data));
  }, [summaryId]);

  const handleDragEnd = ({ source, destination, draggableId }) => {
    if (!destination || source.droppableId === destination.droppableId) return;
    const updated = tasks.map(task =>
      task.task_id === draggableId ? { ...task, status: destination.droppableId } : task
    );
    const moved = updated.find(t => t.task_id === draggableId);
    setTasks(updated);
    fetch(`http://localhost:3001/tasks/${draggableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(moved),
    });
  };

  const handleAdd = () => setModal({ open: true, task: null });

  const handleEdit = (task) => setModal({ open: true, task });

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3001/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter(t => t.task_id !== id));
  };

  const handleSave = async (task) => {
    if (task.task_id) {
      await fetch(`http://localhost:3001/tasks/${task.task_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      setTasks(tasks.map(t => (t.task_id === task.task_id ? task : t)));
    } else {
      const res = await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, summary_id: summaryId }),
      });
      const { task_id } = await res.json();
      setTasks([...tasks, { ...task, task_id, summary_id: summaryId }]);
    }
    setModal({ open: false, task: null });
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>🗂️ 칸반보드</h1>
      <button onClick={handleAdd}>+ 할 일 추가</button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: 20 }}>
          {STATUSES.map(status => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks.filter(t => t.status === status)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DragDropContext>
      {modal.open && (
        <TaskModal
          task={modal.task}
          onClose={() => setModal({ open: false, task: null })}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
