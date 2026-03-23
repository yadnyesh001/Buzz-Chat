import { useState } from "react";

const Avatar = ({ src, name, size = "w-12", className = "" }) => {
	const [imgError, setImgError] = useState(false);

	const fallbackUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name || "User")}&backgroundColor=6366f1&textColor=ffffff`;

	return (
		<div className={`${size} rounded-full overflow-hidden ${className}`}>
			<img
				src={imgError || !src ? fallbackUrl : src}
				alt={name || "avatar"}
				onError={() => setImgError(true)}
				className="w-full h-full object-cover"
				referrerPolicy="no-referrer"
			/>
		</div>
	);
};

export default Avatar;
