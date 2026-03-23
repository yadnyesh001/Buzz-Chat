import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";

const Home = () => {
	return (
		<div className='flex h-[85vh] w-full max-w-5xl rounded-2xl overflow-hidden bg-gray-900/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40'>
			<Sidebar />
			<MessageContainer />
		</div>
	);
};
export default Home;
