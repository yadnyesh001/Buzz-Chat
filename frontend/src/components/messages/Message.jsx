import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import Avatar from "../Avatar";
import { Streamdown } from "streamdown";

const Message = ({ message }) => {
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	const fromMe = message.senderId === authUser._id;
	const formattedTime = extractTime(message.createdAt);
	const chatClassName = fromMe ? "chat-end" : "chat-start";
	const profilePic = fromMe ? authUser.profilePic : selectedConversation?.profilePic;
	const profileName = fromMe ? authUser.fullName : selectedConversation?.fullName;

	const shakeClass = message.shouldShake ? "shake" : "";

	return (
		<div className={`chat ${chatClassName}`}>
			<div className='chat-image avatar'>
				<Avatar src={profilePic} name={profileName} size="w-9" />
			</div>
			<div className={`chat-bubble ${fromMe ? "bg-blue-600 text-white" : "bg-gray-700/80 text-gray-100"} ${shakeClass} pb-2 shadow-md`}>
				<Streamdown>
					{message.message}
				</Streamdown>
			</div>
			<div className='chat-footer opacity-40 text-xs flex gap-1 items-center mt-0.5'>{formattedTime}</div>
		</div>
	);
};
export default Message;
