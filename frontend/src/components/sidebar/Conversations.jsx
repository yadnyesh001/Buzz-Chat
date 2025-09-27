import useGetConversations from "../../hooks/useGetConversations";
import { getRandomEmoji } from "../../utils/emojis";
import Conversation from "./Conversation";
import Bot from "./Bot"; // Import Bot component

const Conversations = () => {
	const { loading, conversations } = useGetConversations();
	const botConversation = {
		_id: "ai-bot",
		fullName: "AI Bot",
		profilePic: "https://cdn-icons-png.flaticon.com/512/1698/1698535.png",
	};

	return (
		<div className='py-2 flex flex-col overflow-auto'>
			<Conversation
				key={botConversation._id}
				conversation={botConversation}
				emoji='🤖'
				lastIdx={conversations.length === 0}
			/>
			{conversations.map((conversation, idx) => (
				<Conversation
					key={conversation._id}
					conversation={conversation}
					emoji={getRandomEmoji()}
					lastIdx={idx === conversations.length - 1}
				/>
			))}

			{loading ? <span className='loading loading-spinner mx-auto'></span> : null}
		</div>
	);
};
export default Conversations;
