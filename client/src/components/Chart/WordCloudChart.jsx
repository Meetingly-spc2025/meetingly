import React from "react";
import { Wordcloud } from "@visx/wordcloud";

export default function WordCloudChart({ keywords }) {
  let parsedKeywords = {};

  try {
    if (typeof keywords === "string") {
      const cleaned = keywords
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
      parsedKeywords = JSON.parse(cleaned);
    } else if (typeof keywords === "object" && keywords !== null) {
      parsedKeywords = keywords;
    }
  } catch (err) {
    console.error("키워드 파싱 오류:", err);
    parsedKeywords = {};
  }

  const sortedWords = Object.entries(parsedKeywords).map(([text, value]) => ({
    text,
    value,
  }));

  // 📌 크기 계산을 위한 정규화
  const values = sortedWords.map((w) => w.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const minFont = 14;
  const maxFont = 50;

  const fontSizeMapper = (datum) => {
    if (max === min) return (minFont + maxFont) / 2;
    const normalized = (datum.value - min) / (max - min);
    return minFont + normalized * (maxFont - minFont);
  };

  const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

  return (
    <div
      style={{
        width: "100%",
        maxHeight: "400px",
        maxWidth: "1000px",
        margin: "0 auto",
        overflow: "visible",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>📌 주요 키워드</h3>
      <Wordcloud
        words={sortedWords}
        width={900}
        height={200}
        fontSize={fontSizeMapper}
        rotate={() => 0}
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
    </div>
  );
}
