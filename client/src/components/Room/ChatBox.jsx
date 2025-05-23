import React from "react";

const ChatBox = ({
  messages,
  dmTargets,
  dmTargetId,
  setDmTargetId,
  nickname,
  sendMessage,
  socketId,
}) => {
  return (
    <div id="chat-container">

      <div id="chat-messages">
        {messages.map((msg, idx) =>
          msg.system ? (
            <div className="notice" key={idx}>
              {msg.message}
            </div>
          ) : (
            <div key={idx} className={msg.id === nickname ? "me" : "other"}>
              {msg.isDm && <strong>[DM]</strong>} {msg.id}: {msg.message}
            </div>
          )
        )}
      </div>

      <div id="chat-input">
        <select
          value={dmTargetId}
          onChange={(e) => setDmTargetId(e.target.value)}
        >
          <option value="all">전체</option>
          {dmTargets
            .filter((u) => u.id !== socketId)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
        </select>
        <input id="chatMessage" type="text" placeholder="메시지 입력" />
        <button onClick={sendMessage}>보내기</button>
      </div>
    </div>
  );
};

export default ChatBox;
