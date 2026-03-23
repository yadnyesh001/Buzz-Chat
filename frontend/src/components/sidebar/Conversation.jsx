import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import Avatar from "../Avatar";

const Conversation = ({ conversation, lastIdx, emoji }) => {
	const { selectedConversation, setSelectedConversation } = useConversation();

	const isSelected = selectedConversation?._id === conversation._id;
	const { onlineUsers } = useSocketContext();
	const isOnline = onlineUsers.includes(conversation._id) || conversation._id === "ai-bot";

	return (
		<>
			<div
				className={`flex gap-3 items-center rounded-xl p-2.5 cursor-pointer transition-all duration-200
				${isSelected ? "bg-blue-600/80 shadow-lg shadow-blue-500/20" : "hover:bg-white/10"}
			`}
				onClick={() => setSelectedConversation(conversation)}
			>
				<div className={`avatar ${isOnline ? "online" : ""}`}>
					<Avatar src={conversation.profilePic} name={conversation.fullName} size="w-11" />
				</div>

				<div className='flex flex-col flex-1 min-w-0'>
					<div className='flex gap-2 justify-between items-center'>
						<p className={`font-medium truncate ${isSelected ? "text-white" : "text-gray-200"}`}>
							{conversation.fullName}
						</p>
						<span className='text-lg flex-shrink-0'>{emoji}</span>
					</div>
					{isOnline && (
						<span className='text-xs text-green-400'>Online</span>
					)}
				</div>
			</div>

			{!lastIdx && <div className='divider my-0.5 py-0 h-px opacity-20' />}
		</>
	);
};
export default Conversation;
