import React from "react";
import { BsCopy } from "react-icons/bs";

export const RoomForm = ({
  roomTitle,
  setRoomTitle,
  roomSubject,
  setRoomSubject,
  roomDate,
  inviteLink,
  showInviteLink,
  showEnterRoomBtn,
  onCreateRoom,
  onCopyLink,
  onEnterRoom,
}) => (
  <form onSubmit={onCreateRoom}>
    <label htmlFor="roomTitle">회의 제목</label>
    <input
      type="text"
      id="roomTitle"
      placeholder="회의 제목을 입력하세요."
      required
      value={roomTitle}
      onChange={(event) => setRoomTitle(event.target.value)}
    />

    <label htmlFor="roomSubject">회의 주제</label>
    <input
      type="text"
      id="roomSubject"
      placeholder="회의 주제를 입력하세요."
      required
      value={roomSubject}
      onChange={(event) => setRoomSubject(event.target.value)}
    />

    <label htmlFor="roomDate">회의 날짜</label>
    <input type="date" id="roomDate" value={roomDate} readOnly />

    {showInviteLink && (
      <div id="invite-link-container">
        <label htmlFor="invite-link">초대 링크</label>
        <div className="flex">
          <input type="text" id="invite-link" readOnly value={inviteLink} />
          <button type="button" onClick={onCopyLink}><BsCopy /></button>
        </div>
      </div>
    )}

    {!showInviteLink && <button type="submit">회의 생성 +</button>}
    {showEnterRoomBtn && (
      <button type="button" onClick={onEnterRoom}>회의 입장 →</button>
    )}
  </form>
);

export const JoinByLink = ({ onJoin, joinLinkRef }) => (
  <div id="link-join-section" style={{ marginTop: "3em" }}>
    <h2>초대 링크로 참여</h2>
    <div className="flex">
      <input
        type="text"
        id="input-invite-link"
        placeholder="초대 링크를 입력하세요"
        ref={joinLinkRef}
      />
      <button type="button" onClick={onJoin}>참여하기 →</button>
    </div>
  </div>
);
