// server/app.js

/**
 * ================================
 * GLOBAL ERROR HANDLING (TOP)
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

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { connectDB } = require("./config/db");

const app = express();

/**
 * ================================
 * MIDDLEWARE
 * ================================
 */
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
    credentials: true
}));
app.use(
    helmet({
        contentSecurityPolicy: false, // Disable default CSP for Vite/Images if needed
    })
);
app.use(xss());

/**
 * ================================
 * RATE LIMITING
 * ================================
 */
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
});
app.use("/api", limiter);

/**
 * ================================
 * ROUTES
 * ================================
 */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/challenges", require("./routes/challengeRoutes"));
app.use("/api/interviews", require("./routes/interviewRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));

/**
 * ================================
 * STATIC ASSETS (Frontend)
 * ================================
 */
// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/dist")));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

/**
 * ================================
 * ERROR HANDLER
 * ================================
 */
app.use((err, req, res, next) => {
    console.error("❌ EXPRESS ERROR:", err);
    res.status(500).json({
        success: false,
        error: "Internal Server Error",
    });
});

/**
 * ================================
 * DATABASE CONNECTION (SAFE)
 * ================================
 */
(async () => {
    try {
        await connectDB();
        console.log("✅ Database connected successfully");
    } catch (err) {
        console.error("❌ Database connection failed");
        console.error(err);
    }
})();

module.exports = app;
