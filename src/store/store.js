import { configureStore } from "@reduxjs/toolkit";

import user from "./userStore";
import notificationReducer from "./notificationSlice";

export default configureStore({
	reducer: {
		user: user.reducer,
		notifications: notificationReducer,
	},
});
