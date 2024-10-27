import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
	fetchNotifications,
	deleteNotification,
} from "../store/notificationSlice";
import {
	addChatRequest,
	removeChatRequest,
} from "../store/chatNotificationSlice";
import style from "../styles/Header.module.css";
import Logo from "./Logo";
import ChatModal from "./ChatModal";
import NavLinks from "./NavLinks";
import useAuth from "../hooks/useAuth";
import socketService from "../services/socket";

const API_URL = import.meta.env.VITE_API_URL;

export default function Header() {
	const { user, fetchProfile, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const notifications = useSelector((state) => state.notifications.items);
	const pendingChats = useSelector(
		(state) => state.chatNotifications.pendingChats
	);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [currentChatPartner, setCurrentChatPartner] = useState(null);
	const [chats, setChats] = useState([]);

	const username = useMemo(() => user?.username, [user]);

	const fetchChats = useCallback(async () => {
		if (username) {
			try {
				const response = await fetch(
					`${API_URL}/chats/user/${username}`,
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
	}, [username]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile, location]);

	useEffect(() => {
		if (username) {
			const socket = socketService.getSocket();
			dispatch(fetchNotifications(username));
			fetchChats();

			const notificationInterval = setInterval(() => {
				dispatch(fetchNotifications(username));
			}, 30000);

			// 채팅 관련 이벤트 핸들러들
			const handleChatRequest = ({ sender, roomId }) => {
				console.log("Chat request received:", { sender, roomId });
				// Redux store에 채팅 요청 추가
				dispatch(
					addChatRequest({
						sender,
						roomId,
					})
				);
				// 즉시 채팅 목록 새로고침
				fetchChats();
			};

			const handleChatAccepted = ({ sender, receiver }) => {
				console.log("Chat accepted:", { sender, receiver });
				// 채팅 요청 제거
				dispatch(removeChatRequest(sender));
				// 채팅 목록 새로고침
				fetchChats();
			};

			const handleReceiveMessage = () => {
				console.log("New message received");
				fetchChats();
			};

			const handleChatDeleted = () => {
				console.log("Chat deleted");
				fetchChats();
			};

			const handleUpdateChatList = () => {
				console.log("Updating chat list");
				fetchChats();
			};

			// 이벤트 리스너 등록
			socket.on("chat_request", handleChatRequest);
			socket.on("chat_accepted", handleChatAccepted);
			socket.on("receive_message", handleReceiveMessage);
			socket.on("chat_deleted", handleChatDeleted);
			socket.on("update_chat_list", handleUpdateChatList);
			socket.on("chat_request_success", ({ roomId, receiver }) => {
				console.log("Chat request success:", { roomId, receiver });
				fetchChats();
			});

			// 사용자 room 참가
			socket.emit("join", { username });

			return () => {
				clearInterval(notificationInterval);
				// 이벤트 리스너 제거
				socket.off("chat_request", handleChatRequest);
				socket.off("chat_accepted", handleChatAccepted);
				socket.off("receive_message", handleReceiveMessage);
				socket.off("chat_deleted", handleChatDeleted);
				socket.off("update_chat_list", handleUpdateChatList);
				socket.off("chat_request_success");

				if (username) {
					socket.emit("leave", { username });
				}
			};
		}
	}, [username, dispatch, fetchChats]);

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

	const handleChatRequestClick = (chatRequest) => {
		console.log("Opening chat with:", chatRequest.sender);
		setCurrentChatPartner(chatRequest.sender);
		setIsChatOpen(true);
		dispatch(removeChatRequest(chatRequest.sender));

		const socket = socketService.getSocket();
		socket.emit("chat_accepted", {
			sender: chatRequest.sender,
			receiver: username,
			roomId: chatRequest.roomId,
		});
	};

	const handleChatIconClick = (chatPartner) => {
		console.log("Opening chat with partner:", chatPartner);
		setCurrentChatPartner(chatPartner);
		setIsChatOpen(true);
	};

	const handleCloseChatModal = useCallback(() => {
		setIsChatOpen(false);
		setCurrentChatPartner(null);
	}, []);

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
					pendingChats={pendingChats}
					chats={chats}
					onNotificationClick={handleNotificationClick}
					onChatRequestClick={handleChatRequestClick}
					onChatIconClick={handleChatIconClick}
				/>
			</nav>
			{isChatOpen && currentChatPartner && (
				<ChatModal
					isOpen={isChatOpen}
					onClose={handleCloseChatModal}
					currentUser={username}
					postAuthor={currentChatPartner}
					initiator={username}
				/>
			)}
		</header>
	);
}
