const GenderCheckbox = ({ onCheckboxChange, selectedGender }) => {
	return (
		<div className='flex gap-4 py-2'>
			<label
				className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-all ${
					selectedGender === "male"
						? "border-blue-500 bg-blue-500/20 text-blue-300"
						: "border-white/10 text-gray-400 hover:border-white/20"
				}`}
			>
				<input
					type='checkbox'
					className='hidden'
					checked={selectedGender === "male"}
					onChange={() => onCheckboxChange("male")}
				/>
				<span className='text-sm font-medium'>Male</span>
			</label>
			<label
				className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-all ${
					selectedGender === "female"
						? "border-pink-500 bg-pink-500/20 text-pink-300"
						: "border-white/10 text-gray-400 hover:border-white/20"
				}`}
			>
				<input
					type='checkbox'
					className='hidden'
					checked={selectedGender === "female"}
					onChange={() => onCheckboxChange("female")}
				/>
				<span className='text-sm font-medium'>Female</span>
			</label>
		</div>
	);
};
export default GenderCheckbox;
