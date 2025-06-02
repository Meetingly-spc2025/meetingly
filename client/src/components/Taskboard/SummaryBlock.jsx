import React from "react";
import "../../styles/Task/SummaryBlock.css";

const SummaryBlock = ({ content, isCreator, onEdit}) => {
  if (!content) return null;

  return (
    <div className="summary-block">
      <div className="summary-header">
        <h3 className="summary-title">3문단 요약</h3>
        {isCreator && (
          <div className="summary-buttons">
            <button onClick={onEdit}>수정</button>
          </div>
        )}
      </div>

      <p>{content}</p>
    </div>
  );
};

export default SummaryBlock;
