// backend/socket/socket.js
const { Server } = require("socket.io");

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",      // tighten this in production
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("[Socket] Client connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("[Socket] Client disconnected:", socket.id);
        });
    });

    console.log("[Socket] Socket.io initialized");
    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized — call initSocket(server) first");
    }
    return io;
}

module.exports = { initSocket, getIO };