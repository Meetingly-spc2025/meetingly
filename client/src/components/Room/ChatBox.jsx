import React from "react";
import { BsSend } from "react-icons/bs";

const ChatBox = ({
  messages,
  recipientList,
  recipientId,
  setRecipientId,
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
              {msg.isDm && <strong>[귓속말]</strong>} {msg.id}: {msg.message}
            </div>
          )
        )}
      </div>

      <div id="chat-input">
        <select
          value={recipientId}
          onChange={(event) => setRecipientId(event.target.value)}
        >
          <option value="all">전체</option>
          {recipientList
            .filter((user) => user.id !== socketId)
            .map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
        </select>
        <input
          id="chatMessage"
          type="text"
          placeholder="메시지 입력"
          style={{ resize: "none" }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}><BsSend style={{ fontSize: "1rem" }} /></button>
      </div>
    </div>
  );
};

export default ChatBox;
