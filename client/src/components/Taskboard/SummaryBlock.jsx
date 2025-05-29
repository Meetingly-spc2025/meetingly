import React from "react";

const SummaryBlock = ({ content }) => {
  if (!content) return null;

  return (
    <div className="summary-block">
      <h3>3문단 요약</h3>
      <p>{content}</p>
    </div>
  );
};

export default SummaryBlock;
