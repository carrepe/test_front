import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import style from "../styles/UserPage.module.css";
import UserImage from "../components/UserImage";
import UserPosts from "../components/UserPosts";
import UserInfo from "../components/UserInfo";
import ChatModal from "../components/ChatModal";
import NotificationList from "../components/NotificationList";
import ChatList from "../components/ChatList";
import useFetch from "../hooks/useFetch";
import socketService from "../services/socket";

const API_URL = import.meta.env.VITE_API_URL;

export default function UserPage() {
	const { userinfo } = useParams();
	const navigate = useNavigate();
	const loginUser = useSelector((state) => state.user.user?.username);
	const [notifications, setNotifications] = useState([]);
	const [chats, setChats] = useState([]);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [selectedChatPartner, setSelectedChatPartner] = useState(null);

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

	useEffect(() => {
		const fetchNotifications = async () => {
			if (loginUser && loginUser === userinfo) {
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
		const notificationInterval = setInterval(fetchNotifications, 30000);
		return () => clearInterval(notificationInterval);
	}, [loginUser, userinfo]);

	useEffect(() => {
		const fetchChats = async () => {
			if (loginUser && loginUser === userinfo) {
				try {
					const response = await fetch(
						`${API_URL}/chats/user/${loginUser}`,
						{
							credentials: "include",
						}
					);
					if (response.ok) {
						const data = await response.json();
						setChats(data);
					}
				} catch (error) {
					console.error("Failed to fetch chats:", error);
				}
			}
		};

		if (loginUser && loginUser === userinfo) {
			fetchChats();
			const socket = socketService.getSocket();

			const handleChatUpdate = () => {
				console.log("Chat list update triggered");
				fetchChats();
			};

			socket.on("chat_request", handleChatUpdate);
			socket.on("chat_accepted", handleChatUpdate);
			socket.on("receive_message", handleChatUpdate);
			socket.on("chat_deleted", handleChatUpdate);
			socket.on("update_chat_list", handleChatUpdate);
			socket.on("chat_request_success", handleChatUpdate);

			socket.emit("join", { username: loginUser });

			return () => {
				socket.off("chat_request", handleChatUpdate);
				socket.off("chat_accepted", handleChatUpdate);
				socket.off("receive_message", handleChatUpdate);
				socket.off("chat_deleted", handleChatUpdate);
				socket.off("update_chat_list", handleChatUpdate);
				socket.off("chat_request_success", handleChatUpdate);
				socket.emit("leave", { username: loginUser });
			};
		}
	}, [loginUser, userinfo]);

	const handleNotificationClick = async (notification) => {
		try {
			await fetch(`${API_URL}/notifications/${notification._id}`, {
				method: "DELETE",
				credentials: "include",
			});
			setNotifications((prev) =>
				prev.filter((n) => n._id !== notification._id)
			);
			navigate(`/detail/${notification.postId}`);
		} catch (error) {
			console.error("Failed to handle notification:", error);
		}
	};

	const handleChatClick = (chatPartner) => {
		setSelectedChatPartner(chatPartner);
		setIsChatOpen(true);
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

			{loginUser === userinfo && (
				<>
					<NotificationList
						notifications={notifications}
						onNotificationClick={handleNotificationClick}
					/>
					<ChatList
						chats={chats}
						currentUser={loginUser}
						onChatClick={handleChatClick}
					/>
				</>
			)}

			{isChatOpen && selectedChatPartner && (
				<ChatModal
					isOpen={isChatOpen}
					onClose={() => {
						setIsChatOpen(false);
						setSelectedChatPartner(null);
					}}
					currentUser={loginUser}
					postAuthor={selectedChatPartner}
					initiator={loginUser}
				/>
			)}
		</section>
	);
}
