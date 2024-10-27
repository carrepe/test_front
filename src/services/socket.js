import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

class SocketService {
	constructor() {
		this.socket = null;
		this.initialized = false;
	}

	initialize() {
		if (this.initialized) return this.socket;

		this.socket = io(API_URL, {
			withCredentials: true,
			transports: ["websocket", "polling"],
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			autoConnect: false,
		});

		this.socket.on("connect", () => {
			console.log("Socket connected successfully");
			this.initialized = true;
		});

		this.socket.on("connect_error", (error) => {
			console.error("Socket connection error:", error);
			this.initialized = false;
		});

		this.socket.on("disconnect", () => {
			console.log("Socket disconnected");
			this.initialized = false;
		});

		this.socket.connect();
		return this.socket;
	}

	getSocket() {
		if (!this.socket || !this.initialized) {
			return this.initialize();
		}
		return this.socket;
	}

	emit(event, data) {
		const socket = this.getSocket();
		if (socket) {
			socket.emit(event, data);
		}
	}

	on(event, callback) {
		const socket = this.getSocket();
		if (socket) {
			socket.on(event, callback);
		}
	}

	off(event) {
		if (this.socket) {
			this.socket.off(event);
		}
	}

	join(room) {
		const socket = this.getSocket();
		if (socket) {
			socket.emit("join", room);
		}
	}

	leave(room) {
		if (this.socket) {
			// eslint-disable-next-line no-undef
			socket.emit("leave", room);
		}
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect();
			this.initialized = false;
		}
	}
}

const socketService = new SocketService();
export default socketService;
