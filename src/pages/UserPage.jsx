import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import style from "../styles/UserPage.module.css";
import UserImage from "../components/UserImage";
import UserPosts from "../components/UserPosts";
import UserInfo from "../components/UserInfo";

const API_URL = import.meta.env.VITE_API_URL;

// 커스텀훅은 파일을 분리하여 사용해 보세요.
const useFetch = (url) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = useCallback(async () => {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("Failed to fetch data");
			}
			const result = await response.json();
			setData(result);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	}, [url]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, error, refetch: fetchData };
};

// 알림 컨포넌트 추가
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

export default function UserPage() {
	const { userinfo } = useParams();
	const navigate = useNavigate();
	const loginUser = useSelector((state) => state.user.user?.username);
	const [notifications, setNotifications] = useState([]); // 알림 상태 추가

	const {
		data: userData,
		loading: userLoading,
		error: userError,
	} = useFetch(`${API_URL}/users/${userinfo}`);

	const {
		data: postsData,
		loading: postsLoading,
		error: postsError,
	} = useFetch(`${API_URL}/posts/user-posts/${userinfo}`);

	// 알림 데이터 가져오기
	useEffect(() => {
		const fetchNotifications = async () => {
			if (loginUser && loginUser === userinfo) {
				// 자신의 페이지일 때만 알림을 가져옴
				try {
					const response = await fetch(
						`${API_URL}/notifications/${loginUser}`,
						{
							credentials: "include",
						}
					);
					if (response.ok) {
						const data = await response.json();
						setNotifications(data);
					}
				} catch (error) {
					console.error("Failed to fetch notifications:", error);
				}
			}
		};

		fetchNotifications();
	}, [loginUser, userinfo]);

	// 알림 클릭 핸들러
	const handleNotificationClick = async (notification) => {
		try {
			// 알림 삭제
			await fetch(`${API_URL}/notifications/${notification._id}`, {
				method: "DELETE",
				credentials: "include",
			});

			// 로컬 상태 업데이트
			setNotifications((prev) =>
				prev.filter((n) => n._id !== notification._id)
			);

			// 해당 게시글로 이동
			navigate(`/detail/${notification.postId}`);
		} catch (error) {
			console.error("Failed to handle notification:", error);
		}
	};

	if (userLoading || postsLoading) return <div>Loading...</div>;
	if (userError || postsError)
		return <div>Error: {userError || postsError}</div>;
	if (!userData) return <div>User not found</div>;

	return (
		<section className={style.UserPage}>
			<h2>UserPage</h2>
			<UserImage
				userImage={userData.userImage}
				username={userData.username}
			/>
			<UserInfo username={userData.username} loginUser={loginUser} />
			<UserPosts posts={postsData} />

			{/* 알림 리스트 추가 */}
			{loginUser === userinfo && (
				<NotificationList
					notifications={notifications}
					onNotificationClick={handleNotificationClick}
				/>
			)}
		</section>
	);
}
