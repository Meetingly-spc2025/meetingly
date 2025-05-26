import React, { useState } from "react";
import TeamInviteModal from "./TeamInviteModal";
import TeamCreateModal from "./TeamCreateModal";
import "../../styles/TeamEmpty.css";

const TeamEmpty = () => {
  // 초대 링크 참여
const [isModalOpen, setModalOpen] = useState(false);
// 팀 생성
const [showModal, setShowModal] = useState(false);

  const handleInviteSubmit = (link) => {
    console.log("초대 링크 제출됨:", link);
    // 여기에 실제 참여 API 호출 등을 구현
  };

  const handleCreate = (teamName) => {
    console.log("새 팀 생성:", teamName);
    setShowModal(false);
  };


  return (
    <div className="my-team-empty-wrapper">
      <h1 className="page-title">나의 팀 관리</h1>
      <div className="empty-box">
        <div className="icon-container">
          <img
            src="/images/team-empty-icon.svg"
            alt="팀 없음 아이콘"
            className="empty-icon"
          />
        </div>
        <p className="empty-title">아직 소속된 팀이 없어요</p>
        <p className="empty-description">
          팀을 생성하거나 초대 링크를 통해 팀에 참여해보세요.
        </p>
        <div className="button-group">
           <button className="primary-button" onClick={() => setShowModal(true)}>팀 만들기</button>
            {showModal && (
              <TeamCreateModal
                onClose={() => setShowModal(false)}
                onCreate={handleCreate}
              />
            )}
        
          <button className="primary-button" onClick={() => setModalOpen(true)}>초대 링크로 참여</button>

          {isModalOpen && (
            <TeamInviteModal
              onClose={() => setModalOpen(false)}
              onSubmit={handleInviteSubmit}
            />
      )}
        </div>
      </div>
    </div>
  );
};

export default TeamEmpty;
