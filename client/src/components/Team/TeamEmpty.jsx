import React, { useState, useEffect } from "react";
import axios from "axios";
import TeamInviteModal from "./TeamInviteModal";
import TeamCreateModal from "./TeamCreateModal";
import LoadingScreen from "../LoadingScreen";
import "../../styles/Task/TeamEmpty.css";

const TeamEmpty = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false); // 초대 링크 참여
  const [showModal, setShowModal] = useState(false); // 팀 생성

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users/jwtauth", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = res.data;
        setUser(data.user);
        console.log("user :: ", data.user);
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };

    fetchUser();
  }, []);

  const handleInviteSubmit = async (link) => {
    console.log("초대 링크 제출됨:", link);
    const teamUrl = link.split("/").pop();

    try {
      await axios.post(
        "/api/teams/join",
        { teamUrl, userId: user.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      alert("팀 참여 성공!");
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("팀 참여 실패");
    }
  };

  const handleCreateSubmit = async (teamName, teamDescription, inviteCode) => {
    try {
      const res = await axios.post(
        "/api/teams/create",
        {
          name: teamName,
          description: teamDescription,
          userId: user.id,
          teamUrl: inviteCode,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      console.log("팀 초대코드 생성:: ", res.data.teamUrl);
      // alert(
      //   `팀 생성 성공! 팀 링크는 ${window.location.origin}/invite/${inviteCode}`,
      // );
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("팀 생성 실패");
    }
  };

  if (!user) return <LoadingScreen />;

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
          <button className="primary-button" onClick={() => setShowModal(true)}>
            팀 만들기
          </button>
          {showModal && (
            <TeamCreateModal
              onClose={() => setShowModal(false)}
              onCreate={handleCreateSubmit}
              userId={user.id}
              userName={user.name}
            />
          )}
          <button className="primary-button" onClick={() => setModalOpen(true)}>
            초대 링크로 참여
          </button>
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
