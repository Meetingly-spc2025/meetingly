const colorPalette = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D7BDE2",
]

const getColorForDate = (dateStr) => {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash % colorPalette.length)
  return colorPalette[index]
}

// 텍스트를 여러 칸에 분배하는 함수
const getDisplayContent = (task, isStartDate, isEndDate, isContinuation, currentDateIndex, totalDays) => {
  const content = task.content || ""

  // 한 칸짜리 태스크인 경우 - ellipsis 처리
  if (isStartDate && isEndDate) {
    return content
  }

  // 여러 칸에 걸친 태스크인 경우 - 텍스트 분배
  if (totalDays > 1) {
    const avgCharsPerDay = Math.ceil(content.length / totalDays)
    const startIndex = currentDateIndex * avgCharsPerDay
    const endIndex = Math.min(startIndex + avgCharsPerDay, content.length)

    if (isStartDate) {
      // 첫 번째 칸: 시작부터 적절한 길이까지
      return content.substring(0, avgCharsPerDay)
    } else if (isEndDate) {
      // 마지막 칸: 남은 텍스트 모두
      const remainingText = content.substring(currentDateIndex * avgCharsPerDay)
      return remainingText
    } else if (isContinuation) {
      // 중간 칸: 해당 부분의 텍스트
      const sectionText = content.substring(startIndex, endIndex)
      return sectionText
    }
  }

  return ""
}

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
  const startDateKey = task.created_at.split("T")[0]
  const color = getColorForDate(startDateKey)

  // 카드 스타일 - 형광펜처럼 연결되도록 수정
  let borderRadius = "6px"
  let marginLeft = "0"
  let marginRight = "0"
  let zIndex = 1
  let textOverflow = "ellipsis"
  const whiteSpace = "nowrap"

  if (isStartDate && !isEndDate) {
    // 시작 카드: 왼쪽만 둥글게, 오른쪽은 직각
    borderRadius = "6px 0px 0px 6px"
    marginRight = "-1px"
    zIndex = 3
    textOverflow = "clip" // 다음 칸으로 이어지므로 ellipsis 제거
  } else if (isEndDate && !isStartDate) {
    // 끝 카드: 오른쪽만 둥글게, 왼쪽은 직각
    borderRadius = "0px 6px 6px 0px"
    marginLeft = "-1px"
    zIndex = 3
    textOverflow = "ellipsis" // 마지막 칸에서는 ellipsis 적용
  } else if (isContinuation) {
    // 중간 카드: 양쪽 모두 직각
    borderRadius = "0px"
    marginLeft = "-1px"
    marginRight = "-1px"
    zIndex = 2
    textOverflow = "clip" // 중간 칸도 다음으로 이어지므로 clip
  } else {
    // 단일 날짜 카드 - ellipsis 적용
    borderRadius = "6px"
    zIndex = 1
    textOverflow = "ellipsis"
  }

  // 표시할 텍스트 계산
  const displayContent = getDisplayContent(task, isStartDate, isEndDate, isContinuation, currentDateIndex, totalDays)

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
        textOverflow: textOverflow,
        whiteSpace: whiteSpace,
        padding: "4px 8px",
        fontSize: "11px",
        margin: "1px 0",
        fontWeight: 500,
        color: "#2D3748",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: `1px solid ${color}`,
        position: "relative",
        minHeight: "20px",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        zIndex: zIndex,
      }}
      title={task.content} // 전체 텍스트를 툴팁으로 표시
      onClick={() => onClick(task)}
    >
      {displayContent}
    </div>
  )
}

export default CalendarTaskCard
