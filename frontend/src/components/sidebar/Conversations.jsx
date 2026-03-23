import useGetConversations from "../../hooks/useGetConversations";
import { getRandomEmoji } from "../../utils/emojis";
import Conversation from "./Conversation";

const Conversations = () => {
	const { loading, conversations } = useGetConversations();
	const botConversation = {
		_id: "ai-bot",
		fullName: "AI Bot",
		profilePic: "https://api.dicebear.com/9.x/bottts/svg?seed=ai-bot&backgroundColor=6366f1",
	};

	return (
		<div className='py-1 flex flex-col overflow-auto flex-1 gap-0.5'>
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

			{loading ? <span className='loading loading-spinner mx-auto mt-4'></span> : null}
		</div>
	);
};
export default Conversations;
