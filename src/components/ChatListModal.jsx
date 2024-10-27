import style from "../styles/Header.module.css";

const ChatListModal = ({ chats, currentUser, onChatClick, onClose }) => {
	if (!chats || chats.length === 0) {
		return (
			<div className={style.chatListModal}>
				<div className={style.modalHeader}>
					<h3>채팅 목록</h3>
					<button onClick={onClose}>닫기</button>
				</div>
				<div className={style.noChatMessage}>
					진행 중인 채팅이 없습니다.
				</div>
			</div>
		);
	}

	return (
		<div className={style.chatListModal}>
			<div className={style.modalHeader}>
				<h3>채팅 목록</h3>
				<button onClick={onClose}>닫기</button>
			</div>
			<ul className={style.modalChatList}>
				{chats.map((chat) => {
					const otherUser = chat.participants.find(
						(p) => p !== currentUser
					);
					const lastMessage = chat.messages[chat.messages.length - 1];

					return (
						<li
							key={chat._id}
							onClick={() => {
								onChatClick(otherUser);
								onClose();
							}}
							className={style.modalChatItem}
						>
							<div className={style.chatItemHeader}>
								<span className={style.chatPartner}>
									{otherUser}
								</span>
								<span className={style.lastMessageDate}>
									{lastMessage
										? new Date(
												lastMessage.timestamp
										  ).toLocaleDateString()
										: ""}
								</span>
							</div>
							<div className={style.lastMessage}>
								{lastMessage
									? lastMessage.content
									: "새로운 채팅"}
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default ChatListModal;
