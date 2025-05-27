import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Task/TeamCreateModal.css";

const TeamCreateModal = ({ onClose, onCreate, userId, userName }) => {
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showToast, setShowToast] = useState(false);

  // 초대 코드
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  useEffect(() => {
    setInviteCode(generateInviteCode());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (teamName.trim()) {
      const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
      onCreate(teamName, teamDescription, inviteCode);
      setTeamName("");
      setTeamDescription("");
    }
  };

  const handleCopy = () => {
    const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">새 팀 만들기</h2>
        <form onSubmit={handleSubmit}>
          <label className="modal-label" htmlFor="teamName">
            팀 이름
          </label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="modal-input"
            placeholder="팀 이름을 입력하세요"
          />

          <label className="modal-label" htmlFor="teamName">
            팀 설명
          </label>
          <input
            id="teamDescription"
            type="text"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            className="modal-input"
            placeholder="팀 설명을 입력하세요"
          />

          <label className="modal-label" htmlFor="teamName">
            초대 링크
          </label>
          <div className="invite-link-wrapper">
            <input
              type="text"
              className="modal-input"
              value={`${window.location.origin}/invite/${inviteCode}`}
              readOnly
            />
            <button type="button" className="copy-button" onClick={handleCopy}>
              복사
            </button>
          </div>

          <button type="submit" className="modal-create-btn">
            팀 생성하기
          </button>

          {showToast && (
            <div className="toast">초대 링크가 복사되었습니다!</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TeamCreateModal;
