// server/server.js

/**
 * ================================
 * GLOBAL ERROR HANDLERS (MUST BE TOP)
 * ================================
 */
process.on("unhandledRejection", (err) => {
    console.error("❌ UNHANDLED PROMISE REJECTION");
    console.error(err);
});

process.on("uncaughtException", (err) => {
    console.error("❌ UNCAUGHT EXCEPTION");
    console.error(err);
});

const http = require("http");
const dotenv = require("dotenv");
const socketUtils = require("./utils/socket");
const app = require("./app");

/**
 * ================================
 * LOAD ENV VARIABLES
 * ================================
 */
dotenv.config();

/**
 * ================================
 * CREATE HTTP SERVER
 * ================================
 */
const server = http.createServer(app);

/**
 * ================================
 * INITIALIZE SOCKET.IO
 * ================================
 */
const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: "*", // change in production
        methods: ["GET", "POST"]
    }
});

// Make io globally accessible (optional but useful)
global.io = io;

/**
 * ================================
 * SOCKET INITIALIZATION
 * ================================
 */
try {
    socketUtils(io);
    console.log("✅ Socket.io initialized");
} catch (err) {
    console.error("❌ Socket initialization failed");
    console.error(err);
}

/**
 * ================================
 * START SERVER
 * ================================
 */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
});
