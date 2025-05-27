import React, { useState } from 'react';
import '../../styles/Task/MyPage.css';

function MyPage() {
  const [isNicknameEditable, setIsNicknameEditable] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [teamName, setTeamName] = useState('개발팀');

  const handleNicknameModify = () => {
    setIsNicknameEditable(true);
    setIsChecked(false);
    setIsAvailable(null);
  };

  const handleNicknameSave = () => {
    setIsNicknameEditable(false);
    console.log('닉네임 저장:', nickname);
  };

  const handleCheckDuplicate = async () => {
    try {
      // const res = await fetch(`/api/check-nickname?nickname=${nickname}`);
      // const data = await res.json();
      // setIsAvailable(data.available);
      setIsAvailable(true);
      setIsChecked(true);
    } catch (err) {
      console.error('중복 확인 에러', err);
    }
  };

  const handleTeamWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = () => {
    setTeamName('');
    setShowWithdrawModal(false);
  };

  const cancelWithdraw = () => {
    setShowWithdrawModal(false);
  };

  return (
    <div className="my-page">
      <h1 className="page-title">마이페이지</h1>

      <div className="profile-section">
        <div className="profile-image-wrapper">
          <img src="/default-profile.png" alt="프로필" className="profile-image" />
          <button className="edit-button">사진 변경</button>
        </div>

        <div className="form-group">
          <label>이름</label>
          <input type="text" placeholder="김미팅" disabled />
        </div>

        <div className="form-group">
          <label>이메일</label>
          <input type="email" placeholder="example@email.com" disabled />
        </div>

        <div className="form-group">
          <label>닉네임</label>
          <div className="change-input">
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              disabled={!isNicknameEditable}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsChecked(false);
                setIsAvailable(null);
              }}
            />
            {isNicknameEditable ? (
              <>
                <button onClick={handleCheckDuplicate} className="inline-button check-button">중복 확인</button>
                <button
                  className="inline-button save-button"
                  onClick={handleNicknameSave}
                  disabled={
                    !nickname.trim() ||  // 입력 안 했거나 공백만
                    !isChecked ||        // 중복 확인 안 함
                    !isAvailable         // 중복 확인 결과 불가
                  }
                >
                  저장
                </button>
              </>
            ) : (
              <button className="inline-button modify-button" onClick={handleNicknameModify}>변경</button>
            )}
          </div>
          {isChecked && (
            <div className={`check-result ${isAvailable ? 'available' : 'unavailable'}`}>
              {isAvailable ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>소속 팀</label>
          <div className="change-input">
            <input type="text" placeholder="소속 팀을 입력하세요." value={teamName} disabled />
            <button className="inline-button withdraw-button" onClick={handleTeamWithdraw}>탈퇴</button>
          </div>
        </div>

        <div className="form-group">
          <label>한 줄 소개</label>
          <textarea placeholder="한 줄 소개를 입력하세요" disabled />
        </div>

        <div className="link-group">
          <a href="/change-password" className="link-button">비밀번호 변경</a>
          <a href="/withdraw-user" className="link-button danger">탈퇴하기</a>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="modal">
          <div className="modal-content">
            <p>정말 팀을 탈퇴하시겠습니까?</p>
            <div className="modal-buttons">
              <button onClick={cancelWithdraw}>취소</button>
              <button onClick={confirmWithdraw} className="danger">탈퇴</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;
