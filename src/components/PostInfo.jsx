import { useState } from "react";
import { useSelector } from "react-redux";
import style from "../styles/PostInfo.module.css";
import { Link } from "react-router-dom";
import ChatModal from "./ChatModal";
import socketService from "../services/socket";

export default function PostInfo({ author, createdAt }) {
	const [isChatOpen, setIsChatOpen] = useState(false);
	const currentUser = useSelector((state) => state.user.user?.username);

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "utc",
		});
	};

	const handleChatClick = async () => {
		try {
			const participants = [currentUser, author].sort();
			const roomId = participants.join("-");

			// 채팅 요청 전송
			socketService.emit("chat_request", {
				sender: currentUser,
				receiver: author,
				roomId,
			});

			console.log("Chat request sent:", {
				sender: currentUser,
				receiver: author,
				roomId,
			});

			// 채팅방 생성 또는 참여
			socketService.emit("join_chat", { participants });

			setIsChatOpen(true);
		} catch (error) {
			console.error("Error starting chat:", error);
		}
	};

	return (
		<div className={style.info}>
			<p>
				작성자:{" "}
				<Link to={`/userpage/${author}`} className={style.author}>
					{author}
				</Link>
				{currentUser && currentUser !== author && (
					<button
						onClick={handleChatClick}
						className={style.chatButton}
					>
						채팅하기
					</button>
				)}
			</p>
			<p>작성일: {formatDate(createdAt)}</p>

			{isChatOpen && (
				<ChatModal
					isOpen={isChatOpen}
					onClose={() => setIsChatOpen(false)}
					currentUser={currentUser}
					postAuthor={author}
					initiator={currentUser}
				/>
			)}
		</div>
	);
}
