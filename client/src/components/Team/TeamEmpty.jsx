import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TeamInviteModal from "./TeamInviteModal";
import TeamCreateModal from "./TeamCreateModal";
import LoadingScreen from "../LoadingScreen";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import "../../styles/Team/TeamEmpty.css";

const TeamEmpty = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false); // 초대 링크 참여
  const [showModal, setShowModal] = useState(false); // 팀 생성
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("토큰 존재 여부:", !!token);

        if (!token) {
          console.log("토큰이 없습니다. 로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        console.log("API 호출 시작");
        const res = await axios.get("/api/users/jwtauth", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API 응답 받음");
        const data = res.data;
        console.log("전체 응답 데이터:", data);

        if (!data || !data.user) {
          console.log("사용자 데이터가 없습니다.");
          navigate("/login");
          return;
        }

        console.log("팀 가입 확인 용:: ", data.user.teamId);

        if (data.user && data.user.teamId) {
          console.log("팀이 존재함, 리다이렉트 시도");
          Swal.fire({
            title: "팀 가입 확인",
            text: "팀에 이미 가입되어 있습니다.",
            icon: "info",
            confirmButtonColor: "#0ea5e9",
          }).then(() => {
            navigate(`/team/${data.user.teamId}`);
          });
          return;
        }

        setUser(data.user);
        console.log("user :: ", data.user);
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
        console.error("에러 상세:", err.response?.data);

        if (err.response?.status === 401) {
          console.log("인증 에러 발생, 로그인 페이지로 이동");
          navigate("/login");
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleInviteSubmit = async (link) => {
    const teamUrl = link.split("/").pop();
    console.log("초대 링크 제출됨:", teamUrl);

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
      Swal.fire({
        title: "팀 참여 성공!",
        text: "팀에 성공적으로 참여했습니다.",
        icon: "success",
        confirmButtonColor: "#0ea5e9",
      }).then(() => {
        setModalOpen(false);
        navigate("/team");
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "팀 참여 실패",
        text: "팀 참여 중 문제가 발생했습니다.",
        icon: "error",
        confirmButtonColor: "#0ea5e9",
      });
    }
  };

  const handleCreateSubmit = async (teamName, teamDescription, inviteCode) => {
    try {
      const res = await axios.post(
        "/api/teams/create",
        {
          teamName: teamName,
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
      const { teamId } = res.data;

      console.log("생성된 팀 아이디:: ", teamId);

      if (teamId) {
        setShowModal(false); // 모달 닫기
        Swal.fire({
          title: "팀 생성 성공!",
          text: "새로운 팀이 성공적으로 생성되었습니다.",
          icon: "success",
          confirmButtonColor: "#0ea5e9",
        }).then(() => {
          navigate(`/team/${teamId}`);
        });
      } else {
        throw new Error("teamId 없음");
      }
    } catch (err) {
      if (err.response?.status === 409) {
        Swal.fire({
          title: "초대 코드 중복",
          text: "이미 존재하는 초대 코드입니다. 다시 시도해주세요.",
          icon: "warning",
          confirmButtonColor: "#0ea5e9",
        });
      } else {
        Swal.fire({
          title: "팀 생성 실패",
          text: "팀 생성 중 문제가 발생했습니다.",
          icon: "error",
          confirmButtonColor: "#0ea5e9",
        });
      }
    }
  };

  if (!user) return <LoadingScreen />;

  return (
    <>
      <div className="my-team-empty-wrapper">
        <h1 className="page-title">나의 팀 관리</h1>
        <div className="empty-box">
          <div className="icon-container">
            <img src="/teamImg.png" alt="팀 없음 아이콘" className="empty-icon" />
          </div>
          <p className="empty-title">아직 소속된 팀이 없어요</p>
          <p className="empty-description">
            팀을 생성하거나 초대 링크를 통해 팀에 참여해보세요.
          </p>
          <div className="button-group">
            <button className="primary-button" onClick={() => setShowModal(true)}>
              팀 만들기
            </button>
            <button className="primary-button" onClick={() => setModalOpen(true)}>
              초대 링크로 참여
            </button>
          </div>
        </div>
      </div>

      {showModal &&
        createPortal(
          <TeamCreateModal
            onClose={() => setShowModal(false)}
            onCreate={handleCreateSubmit}
            userId={user.id}
            userName={user.name}
          />,
          document.body,
        )}

      {isModalOpen &&
        createPortal(
          <TeamInviteModal
            onClose={() => setModalOpen(false)}
            onSubmit={handleInviteSubmit}
          />,
          document.body,
        )}
    </>
  );
};

export default TeamEmpty;
