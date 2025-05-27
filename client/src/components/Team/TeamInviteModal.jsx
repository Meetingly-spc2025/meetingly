import React, { useState } from "react";
import "../../styles/Task/TeamInviteModal.css";

const TeamInviteModal = ({ onClose, onSubmit }) => {
  const [inviteLink, setInviteLink] = useState("");

  const handleSubmit = () => {
    if (inviteLink.trim()) {
      onSubmit(inviteLink);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="invite-modal">
        <h2 className="modal-title">초대 링크로 팀 참여</h2>
        <p className="modal-description">
          받은 초대 링크를 아래 입력창에 붙여넣고 참여해보세요.
        </p>
        <input
          type="text"
          placeholder="https://meetingly.team/invite/abcd1234"
          value={inviteLink}
          onChange={(e) => setInviteLink(e.target.value)}
          className="invite-input"
        />
        <div className="modal-buttons">
          <button className="submit-button" onClick={handleSubmit}>
            참여하기
          </button>
          <button className="cancel-button" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamInviteModal;
