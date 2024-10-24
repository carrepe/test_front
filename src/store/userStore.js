import { createSlice } from "@reduxjs/toolkit";

let user = createSlice({
	name: "user",
	initialState: {
		user: null,
	},

	reducers: {
		setUserAllInfo: (state, action) => {
			state.user = action.payload;
		},
	},
});

export const { setUserAllInfo } = user.actions;
export default user;
