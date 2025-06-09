let io = null;

module.exports = {
  initIO: (server) => {
    const { Server } = require("socket.io");
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.IO has not been initialized.");
    }
    return io;
  },
};
