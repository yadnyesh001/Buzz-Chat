import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
	return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { authUser } = useAuthContext();

	useEffect(() => {
		if (authUser) {
			const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
			console.log("Connecting to socket server:", serverUrl);
			
			const socket = io(serverUrl, {
				query: {
					userId: authUser._id,
				},
				transports: ["websocket", "polling"], // Allow fallback to polling
				withCredentials: true,
			});

			// Add connection event listeners for debugging
			socket.on("connect", () => {
				console.log("Socket connected:", socket.id);
			});

			socket.on("connect_error", (error) => {
				console.error("Socket connection error:", error);
			});

			setSocket(socket);

			// socket.on() is used to listen to the events. can be used both on client and server side
			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			return () => socket.close();
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [authUser]);

	return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
};