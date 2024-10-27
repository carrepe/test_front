import { useState } from "react";
import { Link } from "react-router-dom";
import style from "../styles/Header.module.css";
import ChatListModal from "./ChatListModal";

const NavLinks = ({
	username,
	logout,
	notifications,
	pendingChats,
	chats,
	onNotificationClick,
	onChatIconClick,
}) => {
	const [showDropdown, setShowDropdown] = useState(false);
	const [showChatList, setShowChatList] = useState(false);

	if (username) {
		return (
			<>
				<Link to="/create">새글등록</Link>
				<span onClick={logout}>로그아웃</span>
				<div className={style.notificationContainer}>
					<div className={style.notificationIconWrapper}>
						<Link to={`/userpage/${username}`}>
							{username}님 입장
						</Link>
						<div
							className={style.iconWrapper}
							onClick={() => setShowDropdown(!showDropdown)}
						>
							{notifications.length > 0 && (
								<>
									<span role="img" aria-label="notification">
										🔔
									</span>
									<span className={style.notificationBadge}>
										{notifications.length}
									</span>
								</>
							)}
						</div>
						<div
							className={style.iconWrapper}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setShowChatList(!showChatList);
							}}
						>
							<span role="img" aria-label="chat">
								💬
							</span>
							{pendingChats.length > 0 && (
								<span className={style.chatBadge}>
									{pendingChats.length}
								</span>
							)}
						</div>
					</div>

					{showDropdown && notifications.length > 0 && (
						<div className={style.notificationDropdown}>
							{notifications.map((notification) => (
								<div
									key={notification._id}
									className={style.notificationItem}
									onClick={() => {
										onNotificationClick(notification);
										setShowDropdown(false);
									}}
								>
									<span role="img" aria-label="notification">
										🔔
									</span>
									<span>
										{notification.type === "comment"
											? `${notification.sender}님이 댓글을 달았습니다.`
											: `${notification.sender}님이 좋아요를 눌렀습니다.`}
									</span>
								</div>
							))}
						</div>
					)}

					{showChatList && (
						<ChatListModal
							chats={chats}
							currentUser={username}
							onChatClick={onChatIconClick}
							onClose={() => setShowChatList(false)}
						/>
					)}
				</div>
			</>
		);
	}
	return (
		<>
			<Link to="/login">로그인</Link>
			<Link to="/register">회원가입</Link>
		</>
	);
};

export default NavLinks;
