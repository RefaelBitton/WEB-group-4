import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import https from "https";
import { Server } from "socket.io";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allows any origin, fine for local dev
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.API_GATEWAY_PORT || process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(morgan("dev"));

// Endpoint to allow internal microservices to emit WebSocket events
app.post("/api/socket/emit", express.json(), (req, res) => {
  const { event, data } = req.body;
  if (!event) {
    return res.status(400).json({ error: "event is required" });
  }
  io.emit(event, data);
  res.json({ success: true });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "API Gateway",
    timestamp: new Date().toISOString()
  });
});

// Configure targets for microservices (with fallbacks for local dev)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://127.0.0.1:3001";
const BOT_SERVICE_URL = process.env.BOT_SERVICE_URL || "http://127.0.0.1:3002";
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || "http://127.0.0.1:3003";
const REPORTING_SERVICE_URL = process.env.REPORTING_SERVICE_URL || "http://127.0.0.1:3004";

// Helper function to create standard proxy configurations
const createServiceProxy = (targetUrl) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: (_path, req) => req.originalUrl,
    logger: console,
    onError: (err, req, res) => {
      console.error(`[Gateway Proxy Error] target: ${targetUrl}, path: ${req.url}`, err);
      res.status(502).json({
        error: "Bad Gateway",
        message: `Failed to connect to backend microservice at ${targetUrl}`,
        details: err.message
      });
    }
  });
};

// Route Proxying Setup
// 1. User Service
app.use("/api/users", createServiceProxy(USER_SERVICE_URL));

// 2. Bot/AI Service
app.use("/api/bot", createServiceProxy(BOT_SERVICE_URL));

// 3. Game Service
// Image proxy – handled directly by the gateway so it works even if the
// game-service hasn't deployed this route yet.
app.get("/api/games/image/proxy", (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).json({ error: "url query parameter is required" });
  }

  let parsed;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const protocol = parsed.protocol === "https:" ? https : http;
  const fetchOptions = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  };

  const proxyReq = protocol.get(parsed, fetchOptions, (upstream) => {
    // Follow one redirect
    if (
      upstream.statusCode >= 300 &&
      upstream.statusCode < 400 &&
      upstream.headers.location
    ) {
      const redirectUrl = new URL(upstream.headers.location, parsed);
      const rProto = redirectUrl.protocol === "https:" ? https : http;
      rProto.get(redirectUrl, fetchOptions, (rUpstream) => {
        res.set("Content-Type", rUpstream.headers["content-type"] || "application/octet-stream");
        res.set("Cache-Control", "public, max-age=86400");
        rUpstream.pipe(res);
      }).on("error", () => res.status(502).json({ error: "Redirect fetch failed" }));
      return;
    }

    if (upstream.statusCode < 200 || upstream.statusCode >= 300) {
      return res
        .status(upstream.statusCode || 502)
        .json({ error: `Upstream returned ${upstream.statusCode}` });
    }

    res.set("Content-Type", upstream.headers["content-type"] || "application/octet-stream");
    res.set("Cache-Control", "public, max-age=86400");
    upstream.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error("[Gateway] Image proxy error:", err.message);
    res.status(502).json({ error: "Failed to fetch image" });
  });

  proxyReq.setTimeout(15000, () => {
    proxyReq.destroy();
    res.status(504).json({ error: "Image request timed out" });
  });
});

app.use("/api/games", createServiceProxy(GAME_SERVICE_URL));

// 4. Reporting Service
app.use("/api/reports", createServiceProxy(REPORTING_SERVICE_URL));

// Fallback for unhandled gateway paths
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "Requested API path does not exist on API Gateway."
  });
});

// Socket.IO WebRTC Signaling and Gamification Logic
io.on("connection", (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  // Gamification events
  socket.on("gamification-event", (data) => {
    // Re-broadcast gamification milestones (like Grammar Hero rank up)
    io.emit("gamification-milestone", data);
  });

  // Activity events
  socket.on("activity-event", (data) => {
    io.emit("child-activity", data);
  });

  // WebRTC Signaling: Join practice room
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    console.log(`[Socket] User ${userId} (${socket.id}) joined room ${roomId}`);
    // Notify others in the room
    socket.to(roomId).emit("user-joined", userId, socket.id);
  });

  // WebRTC Signaling: Offer
  socket.on("offer", (payload) => {
    // Payload should contain target (socket id of peer) and sdp offer
    io.to(payload.target).emit("offer", {
      sdp: payload.sdp,
      callerId: socket.id
    });
  });

  // WebRTC Signaling: Answer
  socket.on("answer", (payload) => {
    // Payload should contain target and sdp answer
    io.to(payload.target).emit("answer", {
      sdp: payload.sdp,
      answererId: socket.id
    });
  });

  // WebRTC Signaling: ICE Candidate
  socket.on("ice-candidate", (payload) => {
    io.to(payload.target).emit("ice-candidate", {
      candidate: payload.candidate,
      senderId: socket.id
    });
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});


server.listen(PORT, () => {
  console.log(`🚀 API Gateway & WebSocket Server is running on port ${PORT}`);
  console.log(`🔗 User Service Proxy target: ${USER_SERVICE_URL}`);
  console.log(`🔗 Bot Service Proxy target: ${BOT_SERVICE_URL}`);
  console.log(`🔗 Game Service Proxy target: ${GAME_SERVICE_URL}`);
  console.log(`🔗 Reporting Service Proxy target: ${REPORTING_SERVICE_URL}`);
});
