import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const { loading, login } = useLogin();

	const handleSubmit = async (e) => {
		e.preventDefault();
		await login(username, password);
	};

	return (
		<div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
			<div className='w-full p-8 rounded-2xl bg-gray-900/70 backdrop-blur-xl border border-white/10 shadow-2xl'>
				<h1 className='text-3xl font-bold text-center text-white mb-6'>
					Login to
					<span className='text-blue-400'> BuzzChat</span>
				</h1>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1.5'>Username</label>
						<input
							type='text'
							placeholder='Enter username'
							className='w-full bg-gray-700/50 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 transition-colors'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1.5'>Password</label>
						<input
							type='password'
							placeholder='Enter password'
							className='w-full bg-gray-700/50 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 transition-colors'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					<Link to='/signup' className='text-sm text-gray-400 hover:text-blue-400 transition-colors inline-block'>
						{"Don't"} have an account?
					</Link>

					<button
						className='w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50'
						disabled={loading}
					>
						{loading ? <span className='loading loading-spinner loading-sm'></span> : "Login"}
					</button>
				</form>
			</div>
		</div>
	);
};
export default Login;
