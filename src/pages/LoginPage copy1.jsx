import { useState } from "react";
import style from "../styles/LoginPage.module.css";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [redirect, setRedirect] = useState(false);
	const [error, setError] = useState("");

	const login = async (e) => {
		// 추가 코드 작성
		e.preventDefault();
		if (!username || !password) {
			setError("아이디와 패스워드를 입력해주세요.");
			return;
		}

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/login`,
				{
					method: "POST",
					body: JSON.stringify({ username, password }),
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			);

			const data = await response.json();

			if (response.ok) {
				setRedirect(true);
			} else {
				setError(data.message || "로그인에 실패했습니다.");
			}
		} catch (error) {
			console.error(error);
			setError("로그인 중 오류가 발생했습니다.");
		}
	};

	if (redirect) {
		return <Navigate to="/" />;
	}

	return (
		<form className={style.LoginPage} onSubmit={login}>
			<h2>로그인 페이지</h2>
			<input
				type="text"
				placeholder="아이디"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<input
				type="password"
				placeholder="패스워드"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			{error && <div className={style.error}>{error}</div>}
			<button type="submit">로그인</button>
		</form>
	);
}
