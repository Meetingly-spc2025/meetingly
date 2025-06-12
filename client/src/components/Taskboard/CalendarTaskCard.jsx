"use client"

const CalendarTaskCard = ({ task }) => {
  // 테마에 맞는 파스텔 색상 배열
  const pastelColors = [
    { bg: "#ffecb3", text: "#e65100" }, // 노랑
    { bg: "#e1bee7", text: "#6a1b9a" }, // 보라
    { bg: "#bbdefb", text: "#0d47a1" }, // 파랑
    { bg: "#c8e6c9", text: "#1b5e20" }, // 초록
    { bg: "#ffcdd2", text: "#b71c1c" }, // 빨강
    { bg: "#b3e5fc", text: "#01579b" }, // 하늘
    { bg: "#f8bbd0", text: "#880e4f" }, // 분홍
    { bg: "#d7ccc8", text: "#3e2723" }, // 갈색
    { bg: "#dcedc8", text: "#33691e" }, // 연두
    { bg: "#cfd8dc", text: "#263238" }, // 회색
  ]

  // 안전한 색상 선택 함수
  const getTaskColor = (task) => {
    try {
      // 기본값 설정
      let colorIndex = 0

      // task와 task_id가 존재하는지 확인
      if (task && task.task_id) {
        // 문자열을 숫자로 변환하되, 실패하면 0 사용
        const taskId = String(task.task_id)
        let numericId = 0

        // 문자열의 각 문자 코드를 합산하여 숫자 생성
        for (let i = 0; i < taskId.length; i++) {
          numericId += taskId.charCodeAt(i)
        }

        colorIndex = numericId % pastelColors.length
      }

      // 인덱스가 유효한지 확인
      if (colorIndex < 0 || colorIndex >= pastelColors.length) {
        colorIndex = 0
      }

      return pastelColors[colorIndex]
    } catch (error) {
      console.warn("색상 선택 중 오류:", error)
      // 오류 발생 시 첫 번째 색상 반환
      return pastelColors[0]
    }
  }

  // 태스크가 없으면 기본 스타일 반환
  if (!task || !task.content) {
    return (
      <div
        style={{
          backgroundColor: "#f5f5f5",
          color: "#666",
          borderRadius: "4px",
          padding: "4px 8px",
          margin: "2px",
          fontSize: "11px",
          fontWeight: "500",
        }}
      >
        제목 없음
      </div>
    )
  }

  const taskColor = getTaskColor(task)

  // 간단한 인라인 스타일 적용
  const cardStyle = {
    backgroundColor: taskColor.bg,
    color: taskColor.text,
    borderRadius: "4px",
    padding: "4px 8px",
    margin: "2px",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  }

  return <div style={cardStyle}>{task.content}</div>
}

export default CalendarTaskCard
