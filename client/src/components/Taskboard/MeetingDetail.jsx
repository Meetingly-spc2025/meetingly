// components/MeetingDetail.jsx
import React from "react";
import "../../styles/MeetingDetail.css"; // CSS 파일 import

const meetingDetail = ({
  title,
  date,
  status,
  attendees,
  description,
  attachments,
  summary,
  audioUrl,
}) => {
  return (
    <div className="meeting-card">
      <div className="meeting-header">
        <h2>{title}</h2>
        <span
          className={`status-badge ${status === "완료" ? "done" : "upcoming"}`}
        >
          {status}
        </span>
      </div>

      <p className="meeting-date">{date}</p>

      <div className="meeting-section">
        <h3>참석자</h3>
        <div className="avatars">
          {attendees.map((person, idx) => (
            <img
              key={idx}
              src={person.avatar}
              alt={person.name}
              title={person.name}
            />
          ))}
        </div>
      </div>

      <div className="meeting-section">
        <h3>회의 내용</h3>
        <p className="multiline">{description}</p>
      </div>

      {attachments?.length > 0 && (
        <div className="meeting-section">
          <h3>첨부파일</h3>
          <ul className="attachments">
            {attachments.map((file, idx) => (
              <li key={idx}>
                <span>{file.name}</span>
                <a href={file.url} download>
                  다운로드
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary && (
        <div className="meeting-section">
          <h3>회의 요약</h3>
          <p className="multiline">{summary}</p>
        </div>
      )}

      {audioUrl && (
        <div className="meeting-section">
          <h3>회의 음성</h3>
          <audio controls>
            <source src={audioUrl} type="audio/mpeg" />
            브라우저가 오디오를 지원하지 않습니다.
          </audio>
        </div>
      )}
    </div>
  );
};

export default meetingDetail;
