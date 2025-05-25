import React, { useState } from "react";
import "../../styles/TeamCreateModal.css";

const TeamCreateModal = ({ onClose, onCreate }) => {
  const [teamName, setTeamName] = useState("");

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
          <button type="submit" className="modal-create-btn">
            팀 만들기
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamCreateModal;
