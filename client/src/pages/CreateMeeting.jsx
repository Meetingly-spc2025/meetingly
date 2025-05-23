import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NicknameForm, RoomForm, JoinByLink } from "./MeetingFormComponents";
import "../styles/CreateMeeting.css";

const CreateMeeting = () => {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [roomTitle, setRoomTitle] = useState("");
  const [roomSubject, setRoomSubject] = useState("");
  const [roomDate, setRoomDate] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [createdRoomName, setCreatedRoomName] = useState("");


  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setRoomDate(formatted);
  }, []);

  const joinLinkRef = useRef();

  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    localStorage.setItem("nickname", nickname);
    setShowRoomForm(true);
  };

  const [showEnterRoomBtn, setShowEnterRoomBtn] = useState(false);

  const handleRoomSubmit = (e) => {
    e.preventDefault();
    if (!roomTitle || !roomSubject || !roomDate) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
  
    const uuid = crypto.randomUUID();
    const roomName = `${roomTitle}_${uuid}`;
    const link = `${window.location.origin}/room/${roomName}`;

    localStorage.setItem("nickname", nickname);
  
    setInviteLink(link);
    setShowInviteLink(true);
    setCreatedRoomName(roomName);
    setShowEnterRoomBtn(true);
  };

  const handleEnterRoom = () => {
    if (!createdRoomName) {
      alert("회의방 정보가 없습니다.");
      return;
    }
    navigate(`/room/${createdRoomName}`);
  };

  const copyLink = () => {
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => alert("초대 링크가 복사되었습니다!"))
      .catch((err) => {
        console.error("복사 실패:", err);
        alert("복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
      });
  };

  const joinByLink = () => {
    const input = joinLinkRef.current.value.trim();
    if (input && input.startsWith("http")) {
      const relativePath = input.replace(window.location.origin, "");
      navigate(relativePath);
    } else {
      alert("유효한 초대 링크를 입력하세요.");
    }
  };

  useEffect(() => {
    const savedNickname = localStorage.getItem("nickname");
    if (savedNickname) {
      setNickname(savedNickname);
      setShowRoomForm(true);
    }

    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setRoomDate(formatted);
  }, []);

  return (
    <div className="create-room">
      <div className="create-room-box">
        <h1>화상 회의 생성</h1>

        {!showRoomForm && (
          <NicknameForm
            nickname={nickname}
            setNickname={setNickname}
            onSubmit={handleNicknameSubmit}
          />
        )}

        {showRoomForm && (
          <>
            <RoomForm
              roomTitle={roomTitle}
              setRoomTitle={setRoomTitle}
              roomSubject={roomSubject}
              setRoomSubject={setRoomSubject}
              roomDate={roomDate}
              inviteLink={inviteLink}
              showInviteLink={showInviteLink}
              showEnterRoomBtn={showEnterRoomBtn}
              onCreateRoom={handleRoomSubmit}
              onCopyLink={copyLink}
              onEnterRoom={handleEnterRoom}
            />
            <JoinByLink
              onJoin={joinByLink}
              joinLinkRef={joinLinkRef}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CreateMeeting;
