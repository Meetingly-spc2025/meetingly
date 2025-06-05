import React from "react";
import { Wordcloud } from "@visx/wordcloud";

export default function WordCloudChart({ text }) {
  const words = text
    ?.toLowerCase()
    .replace(/[^ㄱ-ㅎ가-힣a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

  const data = Object.entries(words).map(([text, value]) => ({ text, value }));

  const fontSizeMapper = (datum) => Math.log2(datum.value + 1) * 15; // 글씨 더 큼

  const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

  return (
    <div
      style={{
        width: "100%",
        height: 500,
        maxWidth: "800px", // 오른쪽까지 더 넓게
        margin: "0 auto",
        overflow: "visible", // 잘림 방지
      }}
    >
      <h3 style={{ marginBottom: "1rem" }}>📌 주요 키워드</h3>
      <Wordcloud
        words={data}
        width={600} // 가로 너비 ↑
        height={500} // 높이 ↑
        fontSize={fontSizeMapper}
        rotate={() => 0} // 세로 글씨 제거
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
