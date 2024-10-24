import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import style from "../styles/LoginPage.module.css";

const API_URL = import.meta.env.VITE_API_URL;

// 커스텀 훅으로 분리하여 재사용해보세요
const useForm = (initialState) => {
	const [values, setValues] = useState(initialState);

	const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		setValues((prev) => ({ ...prev, [name]: value }));
	}, []);

	return [values, handleChange];
};

const loginUser = async (username, password) => {
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

export default function LoginPage() {
	const [{ username, password }, handleChange] = useForm({
		username: "",
		password: "",
	});
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!username || !password) {
			setError("아이디와 패스워드를 입력해주세요.");
			return;
		}

		try {
			await loginUser(username, password);
			navigate("/");
		} catch (error) {
			console.error(error);
			setError(error.message || "로그인 중 오류가 발생했습니다.");
		}
	};

	return (
		<form className={style.LoginPage} onSubmit={handleSubmit}>
			<h2>로그인 페이지</h2>
			<input
				type="text"
				name="username"
				placeholder="아이디"
				value={username}
				onChange={handleChange}
			/>
			<input
				type="password"
				name="password"
				placeholder="패스워드"
				value={password}
				onChange={handleChange}
			/>
			{error && <div className={style.error}>{error}</div>}
			<button type="submit">로그인</button>
		</form>
	);
}
