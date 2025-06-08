import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
5;
import "../../styles/Task/MyPage.css";

function MyPage() {
  const imageOptions = [
    "/images/profile1.png",
    "/images/profile2.png",
    "/images/profile3.png",
    "/images/profile4.png",
    "/images/profile5.png",
  ];

  const [isNicknameEditable, setIsNicknameEditable] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userId: "",
    name: "",
    email: "",
    teamId: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const resUser = await axios.get("/api/users/jwtauth", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = resUser.data.user;
        console.log("user는 :: ", user);
        setUserInfo({
          userId: user.id,
          name: user.name,
          email: user.email,
          teamId: user.teamId,
        });
        setNickname(user.nickname || "");
        setProfileImage(user.userImage || "");

        const resTeam = await axios.get(`/api/mypage/team-data?teamId=${user.teamId}`);
        const teamData = resTeam.data.teamName || "";
        setTeamName(teamData);
      } catch (err) {
        alert("로그인을 해야 이용 가능한 페이지 입니다.😊");
        navigate("/login");
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
        "/api/mypage/update-nickname",
        { userInfo, nickname },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("닉네임 저장 성공:", nickname);
      setIsNicknameEditable(false);
      window.location.reload();
    } catch (err) {
      console.error("닉네임 저장 실패:", err);
    }
  };

  // 닉네임 중복검사
  const handleCheckDuplicate = async () => {
    try {
      const res = await axios.get(`/api/mypage/check-nickname?nickname=${nickname}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsAvailable(res.data.available); // true/false
      setIsChecked(true);
    } catch (err) {
      alert("이미 존재하는 닉네임 입니다. 다른 닉네임으로 입력해주세요.");
      window.location.reload();
      console.error("중복 확인 에러", err);
    }
  };

  // 서비스 탈퇴
  const handleMeetinglyWithdraw = async () => {
    try {
      await axios.post(
        "/api/mypage/leave-meetingly",
        { userInfo },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("미팅리 탈퇴 완료");
      setTeamId("");
    } catch (err) {
      console.error("미팅리 탈퇴 실패:", err);
    } finally {
      setShowWithdrawModal(false);
    }
  };

  // 팀 탈퇴 버튼
  const handleTeamWithdraw = async () => {
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = async () => {
    try {
      await axios.post(
        "/api/mypage/leave-team",
        { userInfo },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("팀 탈퇴 완료");
      setUserInfo.teamId(null);
      alert("팀 탈퇴가 완료되었습니다.");
      navigate("/team");
    } catch (err) {
      console.error("팀 탈퇴 실패:", err);
    } finally {
      setShowWithdrawModal(false);
    }
  };

  const cancelWithdraw = () => {
    setShowWithdrawModal(false);
  };

  const handleImageSave = async () => {
    try {
      await axios.put(
        "/api/mypage/update-profile-image",
        {
          userId: userInfo.userId,
          user_image: profileImage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert("프로필 이미지가 변경되었습니다.");
      setShowImageModal(false);
    } catch (err) {
      console.error("이미지 저장 실패:", err);
      alert("프로필 이미지 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="my-page">
      <h1 className="page-title">마이페이지</h1>

      <div className="profile-section">
        <div className="profile-image-wrapper">
          <img src={profileImage} alt="프로필" className="profile-image" />
          <button className="edit-button" onClick={() => setShowImageModal(true)}>
            사진 변경
          </button>
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
            <div className={`check-result ${isAvailable ? "available" : "unavailable"}`}>
              {isAvailable ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다."}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>소속 팀</label>
          <div className="change-input">
            <input
              type="text"
              placeholder="소속 팀이 없습니다. 팀에 가입하고 서비스를 이용해보세요."
              value={teamName || ""}
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
          <a
            href="/withdraw-user"
            className="link-button danger"
            onClick={handleMeetinglyWithdraw}
          >
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
              <button className="modal-button confirm" onClick={confirmWithdraw}>
                탈퇴
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>프로필 사진 선택</h3>
            <div className="image-option-list">
              {imageOptions.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`옵션 ${idx + 1}`}
                  className={`profile-option ${profileImage === img ? "selected" : ""}`}
                  onClick={() => setProfileImage(img)}
                />
              ))}
            </div>
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={() => setShowImageModal(false)}
              >
                취소
              </button>
              <button className="modal-button confirm" onClick={handleImageSave}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;
