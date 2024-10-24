import { useState } from "react";
import style from "../styles/LoginPage.module.css";

export default function RegisterPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [passwordCheck, setPasswordCheck] = useState("");

	const register = async (e) => {
		e.preventDefault();
		console.log(username, password, passwordCheck);

		if (!/^[a-zA-Z][a-zA-Z0-9]{3,}$/.test(username)) {
			alert("아이디는 4자 이상이어야 하며 영어로 시작해야 합니다.");
			return;
		}

		if (password.length < 4) {
			alert("비밀번호는 4자 이상이어야 합니다.");
			return;
		}

		if (password !== passwordCheck) {
			alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
			return;
		}

		// 회원가입 정보를 서버로 전송
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/register`,
			{
				method: "POST",
				body: JSON.stringify({ username, password }),
				headers: {
					"Content-Type": "application/json", // text/paine 일반 텍스트 타입
				},
			}
		);

		if (response.ok) {
			window.location.href = "/login";
		} else {
			alert("이미 존재하는 아이디입니다.");
		}
	};
	return (
		<form className={style.RegisterPage} onSubmit={register}>
			<h2>회원가입페이지</h2>
			<input
				type="text"
				placeholder="사용자이름"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<input
				type="password"
				placeholder="패스워드"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<input
				type="password"
				placeholder="패스워드 확인"
				value={passwordCheck}
				onChange={(e) => setPasswordCheck(e.target.value)}
			/>
			<button type="submit">가입하기</button>
		</form>
	);
}
