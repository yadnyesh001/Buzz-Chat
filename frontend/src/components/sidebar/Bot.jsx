import Avatar from "../Avatar";

const Bot = () => {
	return (
		<div className='avatar online'>
			<Avatar
				src='https://api.dicebear.com/9.x/bottts/svg?seed=ai-bot&backgroundColor=6366f1'
				name='AI Bot'
				size='w-12'
			/>
		</div>
	);
};
export default Bot;
