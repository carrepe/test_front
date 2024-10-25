import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

// 알림 조회 thunk
export const fetchNotifications = createAsyncThunk(
	"notifications/fetchNotifications",
	async (username) => {
		const response = await fetch(`${API_URL}/notifications/${username}`, {
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error("Failed to fetch notifications");
		}
		return response.json();
	}
);

// 알림 삭제 thunk
export const deleteNotification = createAsyncThunk(
	"notifications/deleteNotification",
	async ({ notificationId, postId }) => {
		const response = await fetch(
			`${API_URL}/notifications/${notificationId}`,
			{
				method: "DELETE",
				credentials: "include",
			}
		);
		if (!response.ok) {
			throw new Error("Failed to delete notification");
		}
		return { notificationId, postId };
	}
);

const notificationSlice = createSlice({
	name: "notifications",
	initialState: {
		items: [],
		loading: false,
		error: null,
	},
	reducers: {
		addNotification: (state, action) => {
			state.items.unshift(action.payload);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchNotifications.pending, (state) => {
				state.loading = true;
			})
			.addCase(fetchNotifications.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
				state.error = null;
			})
			.addCase(fetchNotifications.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message;
			})
			.addCase(deleteNotification.fulfilled, (state, action) => {
				state.items = state.items.filter(
					(item) => item._id !== action.payload.notificationId
				);
			});
	},
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
