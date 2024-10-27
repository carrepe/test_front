import style from "../styles/UserPage.module.css";

const ChatList = ({ chats, currentUser, onChatClick }) => {
	if (!chats || chats.length === 0) {
		return (
			<div className={style.noChatMessage}>
				진행 중인 채팅이 없습니다.
			</div>
		);
	}

	return (
		<div className={style.chatListContainer}>
			<h3>채팅 목록</h3>
			<ul className={style.chatList}>
				{chats.map((chat) => {
					const otherUser = chat.participants.find(
						(p) => p !== currentUser
					);
					const lastMessage = chat.messages[chat.messages.length - 1];

					return (
						<li
							key={chat._id}
							onClick={() => onChatClick(otherUser)}
							className={style.chatItem}
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

export default ChatList;
