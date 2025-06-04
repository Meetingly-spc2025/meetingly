import React, { useState } from "react";
import "../../styles/Task/SummaryBlock.css";

const SummaryBlock = ({ content, isCreator, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    onEdit({ content: editedContent });
    setIsEditing(false);
  };

  return (
    <div className="summary-block">
      <div className="summary-header">
        <h3 className="summary-title">3문단 요약</h3>
        {isCreator && !isEditing && (
          <div className="summary-buttons">
            <button onClick={() => setIsEditing(true)}>수정</button>
          </div>
        )}
        {isCreator && isEditing && (
          <div className="summary-buttons">
            <button onClick={handleSave}>저장</button>
            <button onClick={() => setIsEditing(false)}>취소</button>
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          style={{ width: "100%", height: "100px" }}
        />
      ) : (
        <p>{content}</p>
      )}
    </div>
  );
};

export default SummaryBlock;
