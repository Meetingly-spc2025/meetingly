"use client"

import { useRef, useEffect, useState } from "react"
import { Wordcloud } from "@visx/wordcloud"

export default function WordCloudChart({ keywords }) {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth
        // 📌 높이 비율을 조정하여 더 작게 만듦 (예: 너비의 30% 또는 최소 150px)
        const newHeight = Math.max(Math.min(newWidth * 0.3, 250), 150) // 최대 높이 250px, 최소 높이 150px
        setDimensions({ width: newWidth, height: newHeight })
      }
    }

    updateDimensions() // 초기 렌더링 시 크기 설정

    const observer = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  let parsedKeywords = {}

  try {
    if (typeof keywords === "string") {
      const cleaned = keywords
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "")
        .trim()
      parsedKeywords = JSON.parse(cleaned)
    } else if (typeof keywords === "object" && keywords !== null) {
      parsedKeywords = keywords
    }
  } catch (err) {
    console.error("키워드 파싱 오류:", err)
    parsedKeywords = {}
  }

  const sortedWords = Object.entries(parsedKeywords).map(([text, value]) => ({
    text,
    value,
  }))

  // 📌 크기 계산을 위한 정규화
  const values = sortedWords.map((w) => w.value)
  const min = values.length > 0 ? Math.min(...values) : 0
  const max = values.length > 0 ? Math.max(...values) : 1
  const minFont = 12 // 최소 폰트 크기 더 줄임
  const maxFont = 40 // 최대 폰트 크기 더 줄임

  const fontSizeMapper = (datum) => {
    if (max === min) return (minFont + maxFont) / 2
    const normalized = (datum.value - min) / (max - min)
    return minFont + normalized * (maxFont - minFont)
  }

  const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxHeight: "300px", // 전체 컨테이너의 최대 높이도 줄임
        maxWidth: "1000px",
        margin: "0 auto",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>📌 주요 키워드</h3>
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Wordcloud
          words={sortedWords}
          width={dimensions.width}
          height={dimensions.height}
          fontSize={fontSizeMapper}
          rotate={() => 0}
          padding={2} // 단어 간 패딩 추가
        >
          {(cloudWords) =>
            cloudWords.map((word, i) => (
              <text
                key={i}
                fontSize={word.size}
                fill={getRandomColor()}
                textAnchor="middle"
                transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
                style={{ fontFamily: "Arial, sans-serif", cursor: "pointer" }}
              >
                {word.text}
              </text>
            ))
          }
        </Wordcloud>
      )}
    </div>
  )
}
