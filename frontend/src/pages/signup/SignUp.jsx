import { Link } from "react-router-dom";
import GenderCheckbox from "./GenderCheckbox";
import { useState } from "react";
import useSignup from "../../hooks/useSignup";

const SignUp = () => {
	const [inputs, setInputs] = useState({
		fullName: "",
		username: "",
		password: "",
		confirmPassword: "",
		gender: "",
	});

	const { loading, signup } = useSignup();

	const handleCheckboxChange = (gender) => {
		setInputs({ ...inputs, gender });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await signup(inputs);
	};

	return (
		<div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
			<div className='w-full p-8 rounded-2xl bg-gray-900/70 backdrop-blur-xl border border-white/10 shadow-2xl'>
				<h1 className='text-3xl font-bold text-center text-white mb-6'>
					Join <span className='text-blue-400'>BuzzChat</span>
				</h1>

				<form onSubmit={handleSubmit} className='space-y-3'>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1.5'>Full Name</label>
						<input
							type='text'
							placeholder='John Doe'
							className='w-full bg-gray-700/50 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 transition-colors'
							value={inputs.fullName}
							onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1.5'>Username</label>
						<input
							type='text'
							placeholder='johndoe'
							className='w-full bg-gray-700/50 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 transition-colors'
							value={inputs.username}
							onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1.5'>Password</label>
						<input
							type='password'
							placeholder='Enter password'
							className='w-full bg-gray-700/50 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 transition-colors'
							value={inputs.password}
							onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1.5'>Confirm Password</label>
						<input
							type='password'
							placeholder='Confirm password'
							className='w-full bg-gray-700/50 border border-white/10 text-white placeholder-gray-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 transition-colors'
							value={inputs.confirmPassword}
							onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
						/>
					</div>

					<GenderCheckbox onCheckboxChange={handleCheckboxChange} selectedGender={inputs.gender} />

					<Link
						to={"/login"}
						className='text-sm text-gray-400 hover:text-blue-400 transition-colors inline-block'
					>
						Already have an account?
					</Link>

					<button
						className='w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50'
						disabled={loading}
					>
						{loading ? <span className='loading loading-spinner loading-sm'></span> : "Sign Up"}
					</button>
				</form>
			</div>
		</div>
	);
};
export default SignUp;
