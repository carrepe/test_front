import { useCallback, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUserAllInfo } from "../store/userStore";
import {
	fetchNotifications,
	deleteNotification,
} from "../store/notificationSlice";
import style from "../styles/Header.module.css";
import Logo from "./Logo";

const API_URL = import.meta.env.VITE_API_URL;

// 커스텀 훅으로 파일 분리해서 재사용 해보세요
// useAuth.js로 분리하여 재사용해보세요
const useAuth = () => {
	const user = useSelector((state) => state.user.user);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const fetchProfile = useCallback(async () => {
		try {
			const response = await fetch(`${API_URL}/auth/profile`, {
				credentials: "include",
			});
			if (response.ok) {
				const userInfo = await response.json();
				console.log("userInfo:", userInfo);

				dispatch(setUserAllInfo(userInfo));
			}
		} catch (error) {
			console.error("Failed to fetch profile:", error);
		}
	}, [dispatch]);

	const logout = useCallback(async () => {
		try {
			await fetch(`${API_URL}/auth/logout`, {
				credentials: "include",
				method: "POST",
			});
			dispatch(setUserAllInfo(null));
			navigate("/");
		} catch (error) {
			console.error("Failed to logout:", error);
		}
	}, [dispatch, navigate]);

	return { user, fetchProfile, logout };
};

// 컨포넌트로 분리하여 재사용해보세요
// 알림기능 추가
const NavLinks = ({ username, logout, notifications, onNotificationClick }) => {
	if (username) {
		return (
			<>
				<Link to="/create">새글등록</Link>
				<span onClick={logout}>로그아웃</span>
				<Link to={`/userpage/${username}`}>
					{username}님 입장{" "}
					{notifications.length > 0 && (
						<span className={style.notificationBadge}>N</span>
					)}
				</Link>
				{/* 하단 모달 코드 필요에 따라 컨포넌트로 분리 */}
				{notifications.length > 0 && (
					<div className={style.notificationDropdown}>
						{notifications.map((notification) => (
							<div
								key={notification._id}
								className={style.notificationItem}
								onClick={() =>
									onNotificationClick(notification)
								}
							>
								{notification.type === "comment"
									? `${notification.sender}님이 댓글을 달았습니다.`
									: `${notification.sender}님이 좋아요를 눌렀습니다.`}
							</div>
						))}
					</div>
				)}
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

export default function Header() {
	const { user, fetchProfile, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const notifications = useSelector((state) => state.notifications.items);

	const username = useMemo(() => user?.username, [user]);
	console.log("Header render", username);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile, location]);

	useEffect(() => {
		if (username) {
			dispatch(fetchNotifications(username));
			const interval = setInterval(() => {
				dispatch(fetchNotifications(username));
			}, 30000);
			return () => clearInterval(interval);
		}
	}, [dispatch, username]);

	const handleLogoClick = useCallback(() => {
		navigate("/");
	}, [navigate]);

	const handleNotificationClick = async (notification) => {
		try {
			await dispatch(
				deleteNotification({
					notificationId: notification._id,
					postId: notification.postId,
				})
			).unwrap();
			navigate(`/detail/${notification.postId}`);
		} catch (error) {
			console.error("Failed to handle notification:", error);
		}
	};

	return (
		<header className={style.Header}>
			<h1 onClick={handleLogoClick} style={{ cursor: "pointer" }}>
				<Logo />
			</h1>
			<nav className={style.gnb}>
				<NavLinks
					username={username}
					logout={logout}
					notifications={notifications}
					onNotificationClick={handleNotificationClick}
				/>
			</nav>
		</header>
	);
}
