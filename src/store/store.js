import { configureStore } from "@reduxjs/toolkit";

import user from "./userStore";
import notificationReducer from "./notificationSlice";
import chatNotificationReducer from "./chatNotificationSlice";

export default configureStore({
	reducer: {
		user: user.reducer,
		notifications: notificationReducer,
		chatNotifications: chatNotificationReducer,
	},
});
