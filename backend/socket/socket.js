import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
import { askGemini } from "../utils/geminiService.js";

const AI_BOT_ID = "ai-bot";

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("chatMessage", async ({ sender, message, receiverId }) => {
    // If message is sent to AI Bot
    if (receiverId === AI_BOT_ID) {
      const botReply = await askGemini(message);

      const botMessage = {
        _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        senderId: AI_BOT_ID,
        receiverId: sender?.toString() ?? "",
        message: botReply,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const senderSocketId = getReceiverSocketId(sender?.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", botMessage);
      }
    } else {
      // Broadcast user message to a specific user
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", { sender, message });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
