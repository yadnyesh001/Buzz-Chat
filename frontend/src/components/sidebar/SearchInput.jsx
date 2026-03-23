import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import useConversation from "../../zustand/useConversation";
import useGetConversations from "../../hooks/useGetConversations";
import toast from "react-hot-toast";

const SearchInput = () => {
	const [search, setSearch] = useState("");
	const { setSelectedConversation } = useConversation();
	const { conversations } = useGetConversations();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!search) return;
		if (search.length < 3) {
			return toast.error("Search term must be at least 3 characters long");
		}

		const conversation = conversations.find((c) => c.fullName.toLowerCase().includes(search.toLowerCase()));

		if (conversation) {
			setSelectedConversation(conversation);
			setSearch("");
		} else toast.error("No such user found!");
	};

	return (
		<form onSubmit={handleSubmit} className='flex items-center gap-2'>
			<input
				type='text'
				placeholder='Search users...'
				className='flex-1 bg-gray-700/50 border border-white/10 text-sm text-white placeholder-gray-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 transition-colors'
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<button type='submit' className='p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors'>
				<IoSearchSharp className='w-5 h-5' />
			</button>
		</form>
	);
};
export default SearchInput;
