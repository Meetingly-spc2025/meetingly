import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "../../components/LoadingScreen";

const MeetingListRedirect = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserTeam = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/api/users/jwtauth", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;

        if (user.teamId) {
          // 팀이 존재하는 경우 → 해당 팀 회의목록 페이지로 이동
          console.log(user.teamId);
          navigate(`/meetinglists/task/${user.teamId}`);
        } else {
          // 팀이 없는 경우 → 팀 생성/가입 페이지로 이동
          navigate("/team/join");
        }
      } catch (err) {
        console.error("유저 팀 정보 확인 실패:", err);
        alert("로그인을 하신 후 서비스 이용이 가능합니다.😊");
        navigate("/login"); // 인증 실패 시 로그인으로
      } finally {
        setLoading(false);
      }
    };

    checkUserTeam();
  }, [navigate]);

  if (loading) return <LoadingScreen />;

  return null; // 이동 중에는 아무것도 안 보이게
};

export default MeetingListRedirect;
