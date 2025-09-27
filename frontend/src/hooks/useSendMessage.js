import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();
	const { socket } = useSocketContext();
	const { authUser } = useAuthContext();

	const sendMessage = async (message) => {
		setLoading(true);
		try {
			if (selectedConversation._id === "ai-bot") {
				if (!socket) {
					throw new Error("Socket connection is not available right now.");
				}
				// Handle sending message to AI bot via socket
				socket.emit("chatMessage", {
					sender: authUser._id,
					message,
					receiverId: "ai-bot",
				});
				setMessages([
					...messages,
					{
						_id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
						senderId: authUser._id,
						message,
						createdAt: new Date().toISOString(),
					},
				]);
			} else {
				const res = await fetch(`/api/messages/send/${selectedConversation._id}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ message }),
				});
				const data = await res.json();
				if (data.error) throw new Error(data.error);

				setMessages([...messages, data]);
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};
export default useSendMessage;