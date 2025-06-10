import React from "react";

// 색상 팔레트
const colorPalette = [
  "#FFCDD2", "#F8BBD0", "#E1BEE7", "#D1C4E9", "#C5CAE9",
  "#B3E5FC", "#B2EBF2", "#B2DFDB", "#C8E6C9", "#DCEDC8",
  "#F0F4C3", "#FFF9C4", "#FFE0B2", "#FFCCBC", "#D7CCC8",
];

// task_id 기반 색상 결정
const getColorForTask = (taskId) => {
  let hash = 0;
  for (let i = 0; i < taskId.length; i++) {
    hash = taskId.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};

// 텍스트 분할 (단어 기준)
const getDisplayContentByWords = (
  task,
  isStartDate,
  isEndDate,
  isContinuation,
  currentDateIndex,
  totalDays
) => {
  const content = task.content || "";
  const words = content.split(" ");
  const totalWords = words.length;
  const wordsPerDay = Math.ceil(totalWords / totalDays);

  const startIndex = currentDateIndex * wordsPerDay;
  const endIndex = Math.min(startIndex + wordsPerDay, totalWords);
  const chunk = words.slice(startIndex, endIndex).join(" ");

  return chunk.length > 30 ? chunk.slice(0, 30) + "..." : chunk;
};

const CalendarTaskCard = ({
  task,
  isStartDate,
  isEndDate,
  isContinuation,
  isTruncated,
  onClick,
  currentDateIndex = 0,
  totalDays = 1,
}) => {
  const color = getColorForTask(task.task_id);

  // 형광펜처럼 이어지는 스타일 계산
  let borderRadius = "6px";
  let marginLeft = "0";
  let marginRight = "0";
  let zIndex = 1;
  let textOverflow = "ellipsis";
  const whiteSpace = "nowrap";

  if (isStartDate && !isEndDate) {
    borderRadius = "6px 0px 0px 6px";
    marginRight = "-1px";
    zIndex = 3;
    textOverflow = "clip";
  } else if (isEndDate && !isStartDate) {
    borderRadius = "0px 6px 6px 0px";
    marginLeft = "-1px";
    zIndex = 3;
    textOverflow = "ellipsis";
  } else if (isContinuation) {
    borderRadius = "0px";
    marginLeft = "-1px";
    marginRight = "-1px";
    zIndex = 2;
    textOverflow = "clip";
  }

  const displayContent = getDisplayContentByWords(
    task,
    isStartDate,
    isEndDate,
    isContinuation,
    currentDateIndex,
    totalDays
  );

  return (
    <div
      className="calendar-tile-task-card"
      style={{
        backgroundColor: color, // 형광펜처럼 배경 유지
        borderRadius,
        marginLeft,
        marginRight,
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow,
        whiteSpace,
        padding: "2px 6px",
        fontSize: "10px",
        lineHeight: "16px",
        height: "20px",
        fontWeight: 500,
        color: "#2D3748",
        boxShadow: "none",
        border: "none", // 테두리 제거
        position: "relative",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        zIndex,
        marginBottom: "2px",
      }}
      title={task.content}
      onClick={() => onClick(task)}
    >
      {displayContent}
    </div>
  );
};

export default CalendarTaskCard;
