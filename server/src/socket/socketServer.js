const { Server } = require("socket.io");

const rooms = {};
const nickInfo = {};

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join_room", ({ roomName, nickname }) => {
      socket.join(roomName);

      if (!rooms[roomName]) {
        rooms[roomName] = [];
        nickInfo[roomName] = {};
      }

      if (rooms[roomName].length >= 4) {
        socket.emit("room_full");
        return;
      }

      rooms[roomName].push(socket.id);
      nickInfo[roomName][socket.id] = nickname;

      const userList = rooms[roomName]
        .filter(id => id !== socket.id)
        .map(id => ({ id, nickname: nickInfo[roomName][id] }));

      socket.emit("welcome", userList);
      socket.to(roomName).emit("user_joined", {
        id: socket.id,
        nickname: nickInfo[roomName][socket.id],
      });
      io.to(roomName).emit("notice", `${nickInfo[roomName][socket.id]}님이 입장하셨습니다.`);
      io.to(roomName).emit("updateNicks", nickInfo[roomName]);
    });

    socket.on("offer", (offer, targetId, callerId) => {
      const roomName = [...socket.rooms].find((r) => r !== socket.id);
      const nickname = nickInfo[roomName][callerId];
      socket.to(targetId).emit("offer", offer, callerId, nickname);
    });

    socket.on("answer", (answer, targetId) => {
      socket.to(targetId).emit("answer", answer, socket.id);
    });

    socket.on("ice", (ice, targetId) => {
      socket.to(targetId).emit("ice", ice, socket.id);
    });

    socket.on("send", (msgData) => {
      const roomName = [...socket.rooms].find(r => r !== socket.id);
      if (msgData.dm === "all") {
        io.to(roomName).emit("message", {
          id: msgData.myNick,
          message: msgData.msg,
        });
      } else {
        io.to(msgData.dm).emit("message", {
          id: msgData.myNick,
          message: msgData.msg,
          isDm: true,
        });
        socket.emit("message", {
          id: msgData.myNick,
          message: msgData.msg,
          isDm: true,
        });
      }
    });

    socket.on("disconnecting", () => {
      const roomsJoined = [...socket.rooms].filter(r => r !== socket.id);

      roomsJoined.forEach(roomName => {
        if (!rooms[roomName]) return;

        rooms[roomName] = rooms[roomName].filter(id => id !== socket.id);
        socket.to(roomName).emit("left_room", socket.id);
        io.to(roomName).emit("notice", `${nickInfo[roomName][socket.id]}님이 퇴장하셨습니다.`);
        delete nickInfo[roomName][socket.id];

        if (rooms[roomName].length > 0) {
          io.to(roomName).emit("updateNicks", nickInfo[roomName]);
        } else {
          delete rooms[roomName];
          delete nickInfo[roomName];
        }
      });
    });

    socket.on("disconnect", () => {});

  });
}

module.exports = initSocket;
