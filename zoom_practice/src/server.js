const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/:roomName", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "room.html"));
});

const httpServer = http.createServer(app);
const io = new Server(httpServer);

const rooms = {};
const nickInfo = {};

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

        const user_ids = rooms[roomName].filter(id => id !== socket.id);
        socket.emit("welcome", user_ids);

        socket.to(roomName).emit("user_joined", socket.id);
        io.to(roomName).emit("notice", `${nickInfo[roomName][socket.id]}님이 입장하셨습니다.`);
        io.to(roomName).emit("updateNicks", nickInfo[roomName]);
    });

    socket.on("offer", (offer, targetId, callerId) => {
        socket.to(targetId).emit("offer", offer, callerId);
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

    socket.on("disconnecting", () => {
        const roomsJoined = [...socket.rooms].filter(r => r !== socket.id);

        roomsJoined.forEach(roomName => {
            if (!rooms[roomName]) return;

            rooms[roomName] = rooms[roomName].filter(id => id !== socket.id);

            socket.to(roomName).emit("left_room", socket.id);
            io.to(roomName).emit("notice", `${nickInfo[roomName][socket.id]}님이 퇴장하셨습니다..`);
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

httpServer.listen(3000, () => console.log("Server running at http://localhost:3000"));
