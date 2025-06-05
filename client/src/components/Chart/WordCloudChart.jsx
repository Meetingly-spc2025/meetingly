import React from "react";
import { Wordcloud } from "@visx/wordcloud";

const stopwords = [
  "이", "이거", "그", "그거", "저", "저는", "것", "수", "등", "의", "을", "를", "은", "는", "에", "로", "가", "도", "하고", "너무", "지금", "그냥", "아마", "근데",
  "하며", "부터", "까지", "으로", "와", "과", "또는", "그리고", "그러나", "이제", "제가", "맞아요", "어떻게", "이렇게", "그래서", "그러면", "일단은", "같아요", "혹시", "일단",
  "있다", "있으며", "있으나", "이때", "같은", "같이", "위해", "위한", "예정", "예정이다", "이와", "하는", "걸로", "다음에", "만약에", "사실",
  "문제", "문제를", "문제가", "해결", "해결하기", "해결해", "사용한", "사용하면서", "필요", "필요하다",
  "포함될", "설정", "설정을", "설정과", "관련된", "관련", "프로젝트", "프로젝트를", "오류", "예상치",
  "못한", "한", "또한", "해서", "해서는", "한다", "되며", "되어", "다양한", "검토", "검토하며",
  "확인", "확인하고", "있으므로", "방안", "찾아야", "하고자", "있어요",
  "이슈", "이슈를", "작업", "작업을", "상황", "내용", "경우", "부분", "형태", "가능성", "중요", "진행", "해당", "기존", "현재", "기본", "부분의", "모든", "항목", "관련한"
];



export default function WordCloudChart({ text }) {
  const wordFreqMap = text
    ?.toLowerCase()
    .replace(/[^ㄱ-ㅎ가-힣a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 1 &&
        !stopwords.includes(word)
    )
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

  // 상위 10개 단어만 추출
  const sortedWords = Object.entries(wordFreqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([text, value]) => ({ text, value }));

  const fontSizeMapper = (datum) => Math.log2(datum.value + 1) * 15;

  const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;

  return (
    <div
      style={{
        width: "100%",
        height: 400,
        maxWidth: "800px",
        margin: "0 auto",
        overflow: "visible",
      }}
    >
      <h3 style={{ marginBottom: "1rem" }}>📌 주요 키워드</h3>
      <Wordcloud
        words={sortedWords}
        width={800}
        height={400}
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
