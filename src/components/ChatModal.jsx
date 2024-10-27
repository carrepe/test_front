import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { removeChatRequest } from "../store/chatNotificationSlice";
import style from "../styles/ChatModal.module.css";
import socketService from "../services/socket";

export default function ChatModal({
	isOpen,
	onClose,
	currentUser,
	postAuthor,
	initiator,
}) {
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [chatRoomId, setChatRoomId] = useState(null);
	const messagesEndRef = useRef(null);
	const dispatch = useDispatch();

	useEffect(() => {
		if (isOpen) {
			const socket = socketService.getSocket();
			const participants = [currentUser, postAuthor].sort();

			if (currentUser === initiator) {
				socket.emit("chat_request", {
					sender: currentUser,
					receiver: postAuthor,
				});
			}

			socket.emit("join_chat", { participants });

			socket.on("previous_messages", (previousMessages) => {
				setMessages(previousMessages);
			});

			socket.on("receive_message", (message) => {
				setMessages((prev) => [...prev, message]);
			});

			socket.on("chat_accepted", ({ sender, receiver, roomId }) => {
				if (sender === currentUser || receiver === currentUser) {
					dispatch(removeChatRequest(sender));
					setChatRoomId(roomId);
				}
			});

			socket.on("chat_request_success", ({ roomId }) => {
				console.log("Chat request success with roomId:", roomId);
				setChatRoomId(roomId);
			});

			socket.on("chat_deleted", () => {
				setMessages([]);
				onClose();
			});

			return () => {
				socket.off("previous_messages");
				socket.off("receive_message");
				socket.off("chat_accepted");
				socket.off("chat_request_success");
				socket.off("chat_deleted");
			};
		}
	}, [isOpen, currentUser, postAuthor, initiator, dispatch]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = (e) => {
		e.preventDefault();
		if (!newMessage.trim()) return;

		const participants = [currentUser, postAuthor].sort();
		const messageData = {
			participants,
			sender: currentUser,
			content: newMessage,
			timestamp: new Date().toISOString(),
		};

		socketService.emit("send_message", messageData);
		setNewMessage("");
	};

	const handleClose = () => {
		socketService.emit("leave_chat", {
			participants: [currentUser, postAuthor].sort(),
		});
		onClose();
	};

	const handleDeleteAndClose = () => {
		if (!chatRoomId) {
			console.error("Chat room ID not found");
			return;
		}

		if (window.confirm("모든 대화 내용이 삭제됩니다. 계속하시겠습니까?")) {
			console.log("Deleting chat room:", chatRoomId);
			socketService.emit("delete_chat", {
				participants: [currentUser, postAuthor].sort(),
				roomId: chatRoomId,
			});
		}
	};

	if (!isOpen) return null;

	return (
		<div className={style.modalOverlay}>
			<div className={style.modalContent}>
				<div className={style.chatHeader}>
					<h3>{postAuthor}님과의 대화</h3>
					<div className={style.buttonGroup}>
						<button
							onClick={handleDeleteAndClose}
							className={style.deleteButton}
							disabled={!chatRoomId}
						>
							모든대화삭제 후 채팅종료
						</button>
						<button onClick={handleClose}>채팅종료</button>
					</div>
				</div>
				<div className={style.messageContainer}>
					{messages.map((message, index) => (
						<div
							key={index}
							className={`${style.message} ${
								message.sender === currentUser
									? style.myMessage
									: style.otherMessage
							}`}
						>
							<span className={style.sender}>
								{message.sender}
							</span>
							<p className={style.content}>{message.content}</p>
							<span className={style.timestamp}>
								{new Date(
									message.timestamp
								).toLocaleTimeString()}
							</span>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>
				<form
					onSubmit={handleSendMessage}
					className={style.messageForm}
				>
					<input
						type="text"
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder="메시지를 입력하세요..."
					/>
					<button type="submit">전송</button>
				</form>
			</div>
		</div>
	);
}
