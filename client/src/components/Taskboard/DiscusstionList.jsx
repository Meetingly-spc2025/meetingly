import React from "react";

const DiscussionList = ({ discussionContent }) => {
  if (!discussionContent) {
    return (
      <div className="discussion-section">
        <h3>주요 논의 사항</h3>
        <p>논의 내용이 없습니다.</p>
      </div>
    );
  }

  // 내용이 여러 줄이면 나눠서 리스트로 출력, 단일 문단이면 그대로 출력
  const lines = discussionContent.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="discussion-section">
      <h3>주요 논의 사항</h3>
      {lines.length > 1 ? (
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
