import { BiLogOut } from "react-icons/bi";
import useLogout from "../../hooks/useLogout";
import { useAuthContext } from "../../context/AuthContext";
import Avatar from "../Avatar";

const LogoutButton = () => {
	const { loading, logout } = useLogout();
	const { authUser } = useAuthContext();

	return (
		<div className='mt-auto pt-3 border-t border-white/10 flex items-center gap-3'>
			<Avatar src={authUser?.profilePic} name={authUser?.fullName} size="w-9" />
			<div className='flex-1 min-w-0'>
				<p className='text-sm text-white font-medium truncate'>{authUser?.fullName}</p>
				<p className='text-xs text-gray-400 truncate'>@{authUser?.username}</p>
			</div>
			{!loading ? (
				<BiLogOut
					className='w-5 h-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors flex-shrink-0'
					onClick={logout}
					title="Logout"
				/>
			) : (
				<span className='loading loading-spinner loading-sm'></span>
			)}
		</div>
	);
};
export default LogoutButton;
