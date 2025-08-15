import { useEffect } from "react";

import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";

import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
	const { socket } = useSocketContext();
	const { messages, setMessages } = useConversation();

	useEffect(() => {
		if (!socket) {
			console.log("No socket available for listening to messages");
			return;
		}

		const handleNewMessage = (newMessage) => {
			console.log("Received new message:", newMessage);
			newMessage.shouldShake = true;
			const sound = new Audio(notificationSound);
			sound.play().catch(e => console.log("Sound play failed:", e));
			setMessages([...messages, newMessage]);
		};

		socket.on("newMessage", handleNewMessage);

		return () => {
			socket.off("newMessage", handleNewMessage);
		};
	}, [socket, setMessages, messages]);
};
export default useListenMessages;