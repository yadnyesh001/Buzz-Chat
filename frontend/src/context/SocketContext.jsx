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
			const configuredUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
			const defaultUrl = import.meta.env.DEV ? "http://localhost:5000" : window.location.origin;
			const serverUrl = configuredUrl || defaultUrl;
			console.log("Connecting to socket server:", serverUrl);

			const socketInstance = io(serverUrl, {
				query: {
					userId: authUser._id,
				},
				transports: ["websocket", "polling"],
				withCredentials: true,
			});

			// Add connection event listeners for debugging
			socketInstance.on("connect", () => {
				console.log("Socket connected:", socketInstance.id);
			});

			socketInstance.on("connect_error", (error) => {
				console.error("Socket connection error:", error);
			});

			setSocket(socketInstance);

			// socket.on() is used to listen to the events. can be used both on client and server side
			socketInstance.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			return () => socketInstance.close();
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [authUser]);

	return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
};