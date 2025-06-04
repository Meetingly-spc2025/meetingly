import React, { useState } from "react";
import "../../styles/Task/DiscussionList.css";

const DiscussionList = ({ discussionContent, isCreator, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(discussionContent);

  const lines = discussionContent.split("\n").filter((line) => line.trim() !== "");

  const handleSave = () => {
    onEdit({ content: editedContent });
    setIsEditing(false);
  };

  return (
    <div className="discussion-section">
      <div className="discussion-header">
        <h3 className="discussion-title">주요 논의 사항</h3>
        {isCreator && !isEditing && (
          <div className="discussion-buttons">
            <button onClick={() => setIsEditing(true)}>수정</button>
          </div>
        )}
        {isCreator && isEditing && (
          <div className="discussion-buttons">
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
      ) : lines.length > 1 ? (
        <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
          {lines.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      ) : (
        <p>{discussionContent}</p>
      )}
    </div>
  );
};

export default DiscussionList;
