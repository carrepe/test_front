import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserAllInfo } from "../store/userStore";
import socketService from "../services/socket";
import { clearChatRequests } from "../store/chatNotificationSlice";

const API_URL = import.meta.env.VITE_API_URL;

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
				dispatch(setUserAllInfo(userInfo));
			}
		} catch (error) {
			console.error("Failed to fetch profile:", error);
		}
	}, [dispatch]);

	const logout = useCallback(async () => {
		try {
			// 소켓 연결 해제
			const socket = socketService.getSocket();
			if (socket && user?.username) {
				socket.emit("leave", { username: user.username });
				socket.disconnect();
			}

			// 로그아웃 API 호출
			await fetch(`${API_URL}/auth/logout`, {
				credentials: "include",
				method: "POST",
			});

			// Redux 상태 초기화
			dispatch(setUserAllInfo(null));
			dispatch(clearChatRequests());

			// 소켓 서비스 초기화
			socketService.initialized = false;
			socketService.socket = null;

			navigate("/");
		} catch (error) {
			console.error("Failed to logout:", error);
		}
	}, [dispatch, navigate, user]);

	return { user, fetchProfile, logout };
};

export default useAuth;
