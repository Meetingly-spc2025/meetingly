import React from "react";
// import "./FileList.css";

const files = [
  { name: "회의록.pdf", url: "/files/회의록.pdf" },
  { name: "기획안.docx", url: "/files/기획안.docx" },
];

const FileList = () => {
  return (
    <div className="file-list">
      <h3>첨부 파일</h3>
      <ul style={{ listStyle: "disc inside", paddingLeft: 0, margin: 0 }}>
        {files.map((file, idx) => (
          <li key={idx}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              📎 {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
