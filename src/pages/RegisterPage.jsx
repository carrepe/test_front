import { useState, useCallback } from "react";
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

const validateForm = (username, password, passwordCheck) => {
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

export default function RegisterPage() {
	const [{ username, password, passwordCheck }, handleChange] = useForm({
		username: "",
		password: "",
		passwordCheck: "",
	});
	const [error, setError] = useState(null);

	const register = async (e) => {
		e.preventDefault();
		const validationError = validateForm(username, password, passwordCheck);
		if (validationError) {
			setError(validationError);
			return;
		}

		try {
			const response = await fetch(`${API_URL}auth/register`, {
				method: "POST",
				body: JSON.stringify({ username, password }),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				window.location.href = "/login";
			} else {
				const data = await response.json();
				setError(data.message || "이미 존재하는 아이디입니다.");
			}
		} catch (err) {
			console.log(err);
			setError("서버 오류가 발생했습니다. 나중에 다시 시도해주세요.");
		}
	};

	return (
		<form className={style.RegisterPage} onSubmit={register}>
			<h2>회원가입페이지</h2>
			{error && <p className={style.errorMessage}>{error}</p>}
			<input
				type="text"
				name="username"
				placeholder="사용자이름"
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
			<input
				type="password"
				name="passwordCheck"
				placeholder="패스워드 확인"
				value={passwordCheck}
				onChange={handleChange}
			/>
			<button type="submit">가입하기</button>
		</form>
	);
}
