import { createSlice } from "@reduxjs/toolkit";

const chatNotificationSlice = createSlice({
	name: "chatNotifications",
	initialState: {
		pendingChats: [], // [{sender: string, timestamp: string, roomId: string}]
	},
	reducers: {
		addChatRequest: (state, action) => {
			// timestamp를 ISO 문자열로 변환하여 저장
			const chatRequest = {
				...action.payload,
				timestamp: new Date().toISOString(),
			};
			state.pendingChats.push(chatRequest);
		},
		removeChatRequest: (state, action) => {
			state.pendingChats = state.pendingChats.filter(
				(chat) => chat.sender !== action.payload
			);
		},
		clearChatRequests: (state) => {
			state.pendingChats = [];
		},
	},
});

export const { addChatRequest, removeChatRequest, clearChatRequests } =
	chatNotificationSlice.actions;
export default chatNotificationSlice.reducer;
