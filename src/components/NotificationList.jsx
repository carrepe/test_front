import style from "../styles/UserPage.module.css";

const NotificationList = ({ notifications, onNotificationClick }) => {
	if (!notifications || notifications.length === 0) {
		return null;
	}

	return (
		<div className={style.notificationContainer}>
			<h3>새로운 알림</h3>
			<ul className={style.notificationList}>
				{notifications.map((notification) => (
					<li
						key={notification._id}
						onClick={() => onNotificationClick(notification)}
						className={style.notificationItem}
					>
						<span className={style.notificationContent}>
							{notification.type === "comment"
								? `${notification.sender}님이 회원님의 게시글에 댓글을 달았습니다.`
								: `${notification.sender}님이 회원님의 게시글을 좋아합니다.`}
						</span>
						<span className={style.notificationDate}>
							{new Date(
								notification.createdAt
							).toLocaleDateString()}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
};

export default NotificationList;
