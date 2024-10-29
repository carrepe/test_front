import { useState } from "react";
import style from "../styles/LoginPage.module.css";
import { useForm, validateForm, registerUser } from "../hooks/useForm";

const API_URL = import.meta.env.VITE_API_URL;

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
			const response = await registerUser(username, password, API_URL);
			if (response.ok) {
				window.location.href = "/login";
			} else {
				const data = await response.json();
				setError(data.message || "이미 존재하는 아이디입니다.");
			}
		} catch (error) {
			setError(error.message);
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
