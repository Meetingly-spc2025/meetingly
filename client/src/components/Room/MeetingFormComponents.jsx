"use client"

export const RoomForm = ({
  roomTitle,
  setRoomTitle,
  roomSubject,
  setRoomSubject,
  roomDate,
  setRoomDate,
  inviteLink,
  showInviteLink,
  showEnterRoomBtn,
  onCreateRoom,
  onCopyLink,
  onEnterRoom,
  isMeetingCreated, // New prop to control button visibility
}) => {
  return (
    <>
      <form className="room-form" onSubmit={onCreateRoom}>
        <div className="form-group">
          <label htmlFor="roomTitle">회의 제목</label>
          <input
            type="text"
            id="roomTitle"
            value={roomTitle}
            onChange={(e) => setRoomTitle(e.target.value)}
            placeholder="회의 제목을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="roomSubject">회의 주제</label>
          <input
            type="text"
            id="roomSubject"
            value={roomSubject}
            onChange={(e) => setRoomSubject(e.target.value)}
            placeholder="회의 주제를 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="roomDate">회의 날짜</label>
          <input type="date" id="roomDate" value={roomDate} onChange={(e) => setRoomDate(e.target.value)} required />
        </div>

        {!isMeetingCreated && ( // Conditionally render the button based on isMeetingCreated
          <button type="submit" className="btn btn-primary btn-full">
            회의 생성하기
          </button>
        )}
      </form>

      {showInviteLink && (
        <div className="invite-section">
          <h3>초대 링크</h3>
          <div className="invite-link-display">
            <input type="text" value={inviteLink} readOnly />
            <button className="copy-button" onClick={onCopyLink}>
              복사
            </button>
          </div>
          {showEnterRoomBtn && (
            <button className="enter-room-btn" onClick={onEnterRoom}>
              회의실 입장하기
            </button>
          )}
        </div>
      )}
    </>
  )
}

export const JoinByLink = ({ onJoin, joinLinkRef }) => {
  return (
    <div className="join-section">
      <h3>초대 링크로 입장하기</h3>
      <div className="join-link-container">
        <input type="text" ref={joinLinkRef} className="join-link-input" placeholder="초대 링크를 붙여넣으세요" />
        <button className="join-btn" onClick={onJoin}>
          입장하기
        </button>
      </div>
    </div>
  )
}
