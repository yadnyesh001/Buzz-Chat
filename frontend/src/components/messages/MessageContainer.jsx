import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import Avatar from "../Avatar";

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation } = useConversation();

	useEffect(() => {
		return () => setSelectedConversation(null);
	}, [setSelectedConversation]);

	return (
		<div className='md:min-w-[450px] flex flex-col flex-1'>
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<>
					<ChatHeader />
					<Messages />
					<MessageInput />
				</>
			)}
		</div>
	);
};
export default MessageContainer;

const ChatHeader = () => {
	const { selectedConversation } = useConversation();
	const { onlineUsers } = useSocketContext();
	const isOnline = onlineUsers.includes(selectedConversation?._id) || selectedConversation?._id === "ai-bot";

	return (
		<div className='flex items-center gap-3 px-4 py-3 bg-gray-800/60 backdrop-blur-sm border-b border-white/10'>
			<div className={`avatar ${isOnline ? "online" : ""}`}>
				<Avatar src={selectedConversation?.profilePic} name={selectedConversation?.fullName} size="w-10" />
			</div>
			<div className='flex flex-col'>
				<span className='text-white font-semibold'>{selectedConversation?.fullName}</span>
				<span className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}>
					{isOnline ? "Online" : "Offline"}
				</span>
			</div>
		</div>
	);
};

const NoChatSelected = () => {
	const { authUser } = useAuthContext();
	return (
		<div className='flex items-center justify-center w-full h-full'>
			<div className='px-4 text-center flex flex-col items-center gap-4'>
				<div className='w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center'>
					<TiMessages className='text-4xl text-blue-400' />
				</div>
				<div>
					<p className='text-xl text-gray-200 font-semibold'>Welcome, {authUser.fullName}!</p>
					<p className='text-gray-400 mt-1'>Select a conversation to start messaging</p>
				</div>
			</div>
		</div>
	);
};
