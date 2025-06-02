const { Server } = require("socket.io");
const meetingModel = require("../models/meetingModel");

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
    socket.on("join_room", async ({ roomName, nickname, meeting_id }) => {
      socket.join(roomName);

      // 방이 존재하지 않을 경우 -> 생성
      if (!rooms[roomName]) {
        rooms[roomName] = {
          users: [],
          meeting_id,
        };
        nickInfo[roomName] = {};
      }

      // 방의 인원이 4인 이상이면, return
      if (rooms[roomName].users.length >= 4) {
        socket.emit("room_full");
        return;
      }

      rooms[roomName].users.push(socket.id);
      nickInfo[roomName][socket.id] = nickname;

      const userList = rooms[roomName].users
        .filter((id) => id !== socket.id)
        .map((id) => ({ id, nickname: nickInfo[roomName][id] }));

      socket.emit("welcome", userList);
      socket.to(roomName).emit("user_joined", {
        id: socket.id,
        nickname: nickInfo[roomName][socket.id],
      });
      io.to(roomName).emit(
        "notice",
        `${nickInfo[roomName][socket.id]}님이 입장하셨습니다.`,
      );
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
      const roomName = [...socket.rooms].find((r) => r !== socket.id);
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

    socket.on("disconnecting", async () => {
      const roomsJoined = [...socket.rooms].filter((r) => r !== socket.id);

      for (const roomName of roomsJoined) {
        if (!rooms[roomName]) continue;

        rooms[roomName].users = rooms[roomName].users.filter(
          (id) => id !== socket.id,
        );
        socket.to(roomName).emit("left_room", socket.id);
        io.to(roomName).emit(
          "notice",
          `${nickInfo[roomName][socket.id]}님이 퇴장하셨습니다.`,
        );
        delete nickInfo[roomName][socket.id];

        if (rooms[roomName].users.length > 0) {
          io.to(roomName).emit("updateNicks", nickInfo[roomName]);
        } else {
          try {
            const meeting_id = rooms[roomName].meeting_id;
            if (meeting_id) {
              await meetingModel.endMeeting(meeting_id, new Date());
            }
          } catch (err) {
            console.error("회의 종료 시간 업데이트 실패:", err);
          }

          delete rooms[roomName];
          delete nickInfo[roomName];
        }
      }
    });

    socket.on("disconnect", () => {});
  });
}

module.exports = initSocket;
