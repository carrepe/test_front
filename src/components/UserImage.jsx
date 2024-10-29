import style from "../styles/UserImage.module.css";
const API_URL = import.meta.env.VITE_API_URL;

export default function UserImage({ userImage, username }) {
	return (
		<div className={style.userimg}>
			{userImage ? (
				userImage.startsWith("http://k.kakaocdn.net") ||
				userImage.startsWith("https://k.kakaocdn.net") ? (
					<img src={userImage} alt={username} />
				) : (
					<img
						src={`${API_URL}/uploads/${userImage}`}
						alt={username}
					/>
				)
			) : (
				<img src="/user-profile.png" alt={username} />
			)}
		</div>
	);
}
