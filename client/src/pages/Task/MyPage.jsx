import React, { useState, useEffect } from "react";
import "../../styles/Task/MyPage.css";

function MyPage() {
  const [isNicknameEditable, setIsNicknameEditable] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [teamName, setTeamName] = useState("개발팀");
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get("/api/users/jwtauth", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;
        setUserInfo({ name: user.name, email: user.email });
        setNickname(user.nickname || "");
        // setTeamName(user.team?.name || ""); // 소속 팀
      } catch (err) {
        console.error("유저 정보 조회 실패:", err);
      }
    };

    fetchUserInfo();
  }, [token]);

  const handleNicknameModify = () => {
    setIsNicknameEditable(true);
    setIsChecked(false);
    setIsAvailable(null);
  };

  // 닉네임 저장
  const handleNicknameSave = async () => {
    try {
      await axios.put(
        "/api/users/update-nickname",
        { nickname },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("닉네임 저장 성공:", nickname);
      setIsNicknameEditable(false);
    } catch (err) {
      console.error("닉네임 저장 실패:", err);
    }
  };

  // 닉네임 중복검사
  const handleCheckDuplicate = async () => {
    try {
      const res = await axios.get(
        `/api/users/check-nickname?nickname=${nickname}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIsAvailable(res.data.available); // true/false
      setIsChecked(true);
    } catch (err) {
      console.error("중복 확인 에러", err);
    }
  };

  const handleTeamWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = async () => {
    try {
      await axios.post(
        "/api/users/leave-team",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("팀 탈퇴 완료");
      setTeamName("");
    } catch (err) {
      console.error("팀 탈퇴 실패:", err);
    } finally {
      setShowWithdrawModal(false);
    }
  };

  const cancelWithdraw = () => {
    setShowWithdrawModal(false);
  };

  return (
    <div className="my-page">
      <h1 className="page-title">마이페이지</h1>

      <div className="profile-section">
        <div className="profile-image-wrapper">
          <img
            src="/default-profile.png"
            alt="프로필"
            className="profile-image"
          />
          <button className="edit-button">사진 변경</button>
        </div>

        <div className="form-group">
          <label>이름</label>
          <input type="text" value={userInfo.name} disabled />
        </div>

        <div className="form-group">
          <label>이메일</label>
          <input type="email" value={userInfo.email} disabled />
        </div>

        <div className="form-group">
          <label>닉네임</label>
          <div className="change-input">
            <input
              type="text"
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
                <button
                  onClick={handleCheckDuplicate}
                  className="inline-button check-button"
                >
                  중복 확인
                </button>
                <button
                  className="inline-button save-button"
                  onClick={handleNicknameSave}
                  disabled={
                    !nickname.trim() || // 입력 안 했거나 공백만
                    !isChecked || // 중복 확인 안 함
                    !isAvailable // 중복 확인 결과 불가
                  }
                >
                  저장
                </button>
              </>
            ) : (
              <button
                className="inline-button modify-button"
                onClick={handleNicknameModify}
              >
                변경
              </button>
            )}
          </div>
          {isChecked && (
            <div
              className={`check-result ${
                isAvailable ? "available" : "unavailable"
              }`}
            >
              {isAvailable
                ? "사용 가능한 닉네임입니다."
                : "이미 사용 중인 닉네임입니다."}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>소속 팀</label>
          <div className="change-input">
            <input
              type="text"
              placeholder="소속 팀을 입력하세요."
              value={teamName}
              disabled
            />
            {teamName && (
              <button
                className="inline-button withdraw-button"
                onClick={handleTeamWithdraw}
              >
                탈퇴
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>한 줄 소개</label>
          <textarea placeholder="한 줄 소개를 입력하세요" disabled />
        </div>

        <div className="link-group">
          <a href="/change-password" className="link-button">
            비밀번호 변경
          </a>
          <a href="/withdraw-user" className="link-button danger">
            탈퇴하기
          </a>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>정말 팀을 탈퇴하시겠습니까?</p>
            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={cancelWithdraw}>
                취소
              </button>
              <button
                className="modal-button confirm"
                onClick={confirmWithdraw}
              >
                탈퇴
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;
