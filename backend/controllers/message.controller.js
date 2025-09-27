import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { askGemini } from "../utils/geminiService.js";

const AI_BOT_ID = "ai-bot";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (receiverId === AI_BOT_ID) {
      const timestamp = new Date();
      const userMessage = {
        _id: new mongoose.Types.ObjectId().toString(),
        senderId: senderId.toString(),
        receiverId: AI_BOT_ID,
        message,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const botReply = await askGemini(message);
      const botMessage = {
        _id: new mongoose.Types.ObjectId().toString(),
        senderId: AI_BOT_ID,
        receiverId: senderId.toString(),
        message: botReply,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const senderSocketId = getReceiverSocketId(senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", botMessage);
      }

      return res.status(201).json(userMessage);
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    // Emit via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // If receiver is AI Bot, generate response
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

    if (userToChatId === AI_BOT_ID) {
      return res.status(200).json([
        {
          _id: "ai-bot-welcome",
          senderId: AI_BOT_ID,
          receiverId: senderId.toString(),
          message: "Hi there! I'm your BuzzChat AI assistant. Ask me anything and I'll reply right away.",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
		}

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};