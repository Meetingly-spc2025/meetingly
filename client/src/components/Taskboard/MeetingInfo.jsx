import React, { useState } from "react";
import "../../styles/Task/MeetingInfo.css";

const Modal = ({ onClose, content }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <button className="modal-close" onClick={onClose}>X</button>
      <div className="modal-text">{content}</div>
    </div>
  </div>
);

const MeetingInfo = ({
  meetingName,
  participants,
  date,
  creator,
  totalDuration,
  fullText,
  isCreator,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="meeting-detail-container">
      <div className="meeting-info-header">
        <h3 className="meeting-info-title">회의 정보</h3>
        {isCreator && (
          <div className="meeting-info-buttons">
            <button onClick={onDelete}>삭제</button>
          </div>
        )}
      </div>
      <div className="cards-wrapper">
        <div className="meeting-detail-card">
          <div className="meeting-info-item row">
            <span className="label">회의 이름</span>
            <span>{meetingName}</span>
          </div>
          <div className="meeting-info-item row">
            <span className="label">참여자 이름</span>
            <span>{participants}</span>
          </div>
          <div className="meeting-info-item row">
            <span className="label">회의 날짜</span>
            <span>{date}</span>
          </div>
        </div>

        <div className="meeting-detail-card">
          <div className="meeting-info-item row">
            <span className="label">회의 생성자</span>
            <span>{creator}</span>
          </div>
          <div className="meeting-info-item row">
            <span className="label">전체 회의 내용</span>
            <button
              className="view-content-button"
              onClick={() => setIsModalOpen(true)}
            >
              보기 📄
            </button>
          </div>
          <div className="meeting-info-item row">
            <span className="label">총 회의시간</span>
            <span>{totalDuration}</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          content={fullText}
        />
      )}
    </div>
  );
};

export default MeetingInfo;
