import { useState } from "react";

export const useForm = (initialState) => {
	const [values, setValues] = useState(initialState);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return [values, handleChange];
};

export const validateForm = (username, password, passwordCheck) => {
	if (!/^[a-zA-Z][a-zA-Z0-9]{3,}$/.test(username)) {
		return "아이디는 4자 이상이어야 하며 영어로 시작해야 합니다.";
	}
	if (password.length < 4) {
		return "비밀번호는 4자 이상이어야 합니다.";
	}
	if (password !== passwordCheck) {
		return "비밀번호와 비밀번호 확인이 일치하지 않습니다.";
	}
	return null;
};

export const registerUser = async (username, password, API_URL) => {
	try {
		const response = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			body: JSON.stringify({ username, password }),
			headers: {
				"Content-Type": "application/json",
			},
		});
		return response;
	} catch (err) {
		console.log(err);
		throw new Error("서버 오류가 발생했습니다. 나중에 다시 시도해주세요.");
	}
};

export const validateLogin = (username, password) => {
	if (!username || !password) {
		return "아이디와 패스워드를 입력해주세요.";
	}
	return null;
};

export const loginUser = async (username, password, API_URL) => {
	const response = await fetch(`${API_URL}/auth/login`, {
		method: "POST",
		body: JSON.stringify({ username, password }),
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message || "로그인에 실패했습니다.");
	}

	return response.json();
};
