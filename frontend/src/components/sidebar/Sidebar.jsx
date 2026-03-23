import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";

const Sidebar = () => {
	return (
		<div className='border-r border-white/10 p-4 flex flex-col w-80 bg-gray-900/30'>
			<div className='mb-3'>
				<h2 className='text-lg font-bold text-white tracking-wide mb-3'>Chats</h2>
				<SearchInput />
			</div>
			<div className='divider my-1 opacity-20'></div>
			<Conversations />
			<LogoutButton />
		</div>
	);
};
export default Sidebar;
