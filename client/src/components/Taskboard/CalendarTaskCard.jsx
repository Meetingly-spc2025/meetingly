import React from "react";

const colorPalette = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F8C471", "#82E0AA", "#F1948A", "#85C1E9", "#D7BDE2",
];

const getColorForDate = (dateStr) => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % colorPalette.length);
  return colorPalette[index];
};

const CalendarTaskCard = ({ task, isStartDate, isEndDate, isContinuation, isTruncated, onClick }) => {
  const startDateKey = task.created_at.split("T")[0];
  const color = getColorForDate(startDateKey);

  // 카드 스타일
  let borderRadius = "6px";
  let marginLeft = "0";
  let marginRight = "0";

  if (isStartDate && !isEndDate) {
    borderRadius = "6px 2px 2px 6px";
    marginRight = "-2px";
  } else if (isEndDate && !isStartDate) {
    borderRadius = "2px 6px 6px 2px";
    marginLeft = "-2px";
  } else if (isContinuation) {
    borderRadius = "2px";
    marginLeft = "-2px";
    marginRight = "-2px";
  }

  // 표시할 텍스트
  const displayContent = isStartDate ? task.content : isTruncated ? " " : "";

  return (
    <div
      className="calendar-tile-task-card"
      style={{
        backgroundColor: color,
        borderRadius,
        marginLeft,
        marginRight,
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        padding: "4px 8px",
        fontSize: "11px",
        margin: "2px 0",
        fontWeight: 500,
        color: "#2D3748",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: `1px solid ${color}`,
        position: "relative",
        minHeight: "20px",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
      title={task.content}
      onClick={() => onClick(task)}  
    >
      {displayContent}
    </div>
  );
};

export default CalendarTaskCard;
