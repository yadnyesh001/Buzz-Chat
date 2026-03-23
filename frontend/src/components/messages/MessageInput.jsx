import { useState } from "react";
import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const { loading, sendMessage } = useSendMessage();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message) return;
		await sendMessage(message);
		setMessage("");
	};

	return (
		<form className='px-4 py-3' onSubmit={handleSubmit}>
			<div className='w-full flex items-center gap-2 bg-gray-700/60 backdrop-blur-sm rounded-xl border border-white/10 px-4 py-2 focus-within:border-blue-500/50 transition-colors'>
				<input
					type='text'
					className='flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none'
					placeholder='Type a message...'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<button
					type='submit'
					className='p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50'
					disabled={loading || !message}
				>
					{loading ? <div className='loading loading-spinner loading-xs'></div> : <BsSend className='w-4 h-4' />}
				</button>
			</div>
		</form>
	);
};
export default MessageInput;
