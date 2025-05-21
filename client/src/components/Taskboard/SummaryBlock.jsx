import React from "react";
// import "./SummaryBlock.css";

const SummaryBlock = () => {
  return (
    <div className="summary-block">
      <h3>3문단 요약</h3>
      <p>
        회의 내용에 대한 요약이 이곳에 표시됩니다. 주요 논의 내용과 결론을
        간결하게 정리합니다.
      </p>
      <p>두 번째 문단 요약입니다. 각 참가자의 역할, 발언 등을 정리합니다.</p>
      <p>마지막 문단에는 후속 조치나 결론 요약이 포함됩니다.</p>
    </div>
  );
};

export default SummaryBlock;
