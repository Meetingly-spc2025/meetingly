
import React from "react";

// 색상 팔레트
const colorPalette = [
  "#FFCDD2", "#F8BBD0", "#E1BEE7", "#D1C4E9", "#C5CAE9",
  "#B3E5FC", "#B2EBF2", "#B2DFDB", "#C8E6C9", "#DCEDC8",
  "#F0F4C3", "#FFF9C4", "#FFE0B2", "#FFCCBC", "#D7CCC8",
];

// task_id 기반 색상 결정
// const getColorForTask = (taskId) => {
//  let hash = 0;
//  for (let i = 0; i < taskId.length; i++) {
//    hash = taskId.charCodeAt(i) + ((hash << 5) - hash);
//    hash = hash & hash;

const getColorForDate = (dateStr) => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % colorPalette.length);
  return colorPalette[index];
};

// 텍스트를 여러 칸에 분배하는 함수
const getDisplayContent = (
  task,
  isStartDate,
  isEndDate,
  isContinuation,
  currentDateIndex,
  totalDays,
) => {
  const content = task.content || "";

  // 한 칸짜리 태스크인 경우 - ellipsis 처리
  if (isStartDate && isEndDate) {
    return content;
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};


// 텍스트 분할 (단어 기준)
// const getDisplayContentByWords = (
//   task,
//   isStartDate,
//   isEndDate,
//   isContinuation,
//   currentDateIndex,
//   totalDays
// ) => {
//   const content = task.content || "";
//   const words = content.split(" ");
//   const totalWords = words.length;
//   const wordsPerDay = Math.ceil(totalWords / totalDays);

//   const startIndex = currentDateIndex * wordsPerDay;
//   const endIndex = Math.min(startIndex + wordsPerDay, totalWords);
//   const chunk = words.slice(startIndex, endIndex).join(" ");

//   return chunk.length > 30 ? chunk.slice(0, 30) + "..." : chunk;


  // 여러 칸에 걸친 태스크인 경우 - 텍스트 분배
  if (totalDays > 1) {
    const avgCharsPerDay = Math.ceil(content.length / totalDays);
    const startIndex = currentDateIndex * avgCharsPerDay;
    const endIndex = Math.min(startIndex + avgCharsPerDay, content.length);

    if (isStartDate) {
      // 첫 번째 칸: 시작부터 적절한 길이까지
      return content.substring(0, avgCharsPerDay);
    } else if (isEndDate) {
      // 마지막 칸: 남은 텍스트 모두
      const remainingText = content.substring(currentDateIndex * avgCharsPerDay);
      return remainingText;
    } else if (isContinuation) {
      // 중간 칸: 해당 부분의 텍스트
      const sectionText = content.substring(startIndex, endIndex);
      return sectionText;
    }
  }

  return "";


const CalendarTaskCard = ({
  task,
  isStartDate,
  isEndDate,
  isContinuation,
  onClick,
  totalDays = 1,
}) => {

//   const color = getColorForTask(task.task_id);

  // 형광펜처럼 이어지는 스타일 계산

  const startDateKey = task.created_at.split("T")[0];
  const color = getColorForDate(startDateKey);

  let borderRadius = "6px";
  let marginLeft = "0";
  let marginRight = "0";
  let zIndex = 1;
  // let textOverflow = "ellipsis";
  // const whiteSpace = "nowrap";


  if (isStartDate && !isEndDate) {
    borderRadius = "6px 0px 0px 6px";
    marginRight = "-1px";
    zIndex = 3;
    // textOverflow = "ellipsis";
  } else if (isEndDate && !isStartDate) {
    borderRadius = "0px 6px 6px 0px";
    marginLeft = "-1px";
    zIndex = 3;
    // textOverflow = "ellipsis";
  } else if (isContinuation) {
    borderRadius = "0px";
    marginLeft = "-1px";
    marginRight = "-1px";
    zIndex = 2;

//   const displayContent = getDisplayContentByWords(
//     task,
//     isStartDate,
//     isEndDate,
//     isContinuation,
//     currentDateIndex,
//     totalDays
//   );
  }

  // 시작일에만 텍스트, 나머지는 빈 bar
  const displayContent = isStartDate ? task.content || "" : "";

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
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        padding: "4px 8px",
        fontSize: "11px",
        minHeight: "32px",
        margin: "1px 0",
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
