import React, { useState } from "react";
import "../../styles/TeamCreateModal.css";

const TeamCreateModal = ({ onClose, onCreate }) => {
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamLink, setTeamLink] = useState("")

  // 초대 코드
  const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10); // 예: 'dk23kf9a'
  };

  


  const handleSubmit = (e) => {
    e.preventDefault();
    if (teamName.trim()) {
      onCreate(teamName);
      setTeamName("");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <h2 className="modal-title">새 팀 만들기</h2>
        <form onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="teamName">팀 이름</label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="modal-input"
            placeholder="팀 이름을 입력하세요"
          />

          <label className="modal-label" htmlFor="teamName">팀 설명</label>
          <input
            id="teamDescription"
            type="text"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            className="modal-input"
            placeholder="팀 설명을 입력하세요"
          />

          <label className="modal-label" htmlFor="teamName">초대 링크</label>
          <input
            id="teamLink"
            type="text"
            value={teamLink}
            onChange={(e) => setTeamLink(e.target.value)}
            className="modal-input"
            placeholder="초대 링크 자동 생성.."
          />
          
          
          <button type="submit" className="modal-create-btn">
            팀 생성하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamCreateModal;
