import style from "../styles/Header.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Logo from "./Logo";
import { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUserAllInfo } from "../store/userStore";

export default function Header() {
	let user = useSelector((state) => state.user.user);
	const username = user?.username;
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();

	const handleLogoClick = () => {
		navigate("/");
	};

	const fetchProfile = useCallback(async () => {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/profile`,
			{
				credentials: "include",
			}
		);
		if (response.ok) {
			const userInfo = await response.json();
			dispatch(setUserAllInfo(userInfo));
		}
	}, [dispatch]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile, location]);

	const logout = async () => {
		fetch(`${import.meta.env.VITE_API_URL}/logout`, {
			credentials: "include",
			method: "POST",
		});
		dispatch(setUserAllInfo(null));
		navigate("/");
	};

	return (
		<header className={style.Header}>
			<h1 onClick={handleLogoClick} style={{ cursor: "pointer" }}>
				<Logo />
			</h1>
			<nav className={style.gnb}>
				{username && (
					<>
						<Link to="/create">새글등록</Link>
						<span onClick={logout}>로그아웃</span>
						<Link to={`/userpage/${username}`}>
							{username}님 입장
						</Link>
					</>
				)}
				{!username && (
					<>
						<Link to="/login">로그인</Link>
						<Link to="/register">회원가입</Link>
					</>
				)}
			</nav>
		</header>
	);
}
