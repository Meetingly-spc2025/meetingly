import { Droppable } from "react-beautiful-dnd";
import TaskCard from "./TaskCard";

export default function TaskColumn({ status, tasks, onEdit, onDelete }) {
  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="taskcolumn-container"
        >
          <h3 className="taskcolumn-title">{status.toUpperCase()}</h3>
          {tasks.map((task, index) => (
            <TaskCard
              key={task.task_id}
              task={task}
              index={index}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task.task_id)}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
