import { useCallback, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUserAllInfo } from "../store/userStore";
import style from "../styles/Header.module.css";
import Logo from "./Logo";

const API_URL = import.meta.env.VITE_API_URL;

// 커스텀 훅으로 파일 분리해서 재사용 해보세요
// useAuth.js로 분리하여 재사용해보세요
const useAuth = () => {
	const user = useSelector((state) => state.user.user);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const fetchProfile = useCallback(async () => {
		try {
			const response = await fetch(`${API_URL}/auth/profile`, {
				credentials: "include",
			});
			if (response.ok) {
				const userInfo = await response.json();
				dispatch(setUserAllInfo(userInfo));
			}
		} catch (error) {
			console.error("Failed to fetch profile:", error);
		}
	}, [dispatch]);

	const logout = useCallback(async () => {
		try {
			await fetch(`${API_URL}/auth/logout`, {
				credentials: "include",
				method: "POST",
			});
			dispatch(setUserAllInfo(null));
			navigate("/");
		} catch (error) {
			console.error("Failed to logout:", error);
		}
	}, [dispatch, navigate]);

	return { user, fetchProfile, logout };
};

// 컨포넌트로 분리하여 재사용해보세요
const NavLinks = ({ username, logout }) => {
	if (username) {
		return (
			<>
				<Link to="/create">새글등록</Link>
				<span onClick={logout}>로그아웃</span>
				<Link to={`/userpage/${username}`}>{username}님 입장</Link>
			</>
		);
	}
	return (
		<>
			<Link to="/login">로그인</Link>
			<Link to="/register">회원가입</Link>
		</>
	);
};

export default function Header() {
	const { user, fetchProfile, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const username = useMemo(() => user?.username, [user]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile, location]);

	const handleLogoClick = useCallback(() => {
		navigate("/");
	}, [navigate]);

	return (
		<header className={style.Header}>
			<h1 onClick={handleLogoClick} style={{ cursor: "pointer" }}>
				<Logo />
			</h1>
			<nav className={style.gnb}>
				<NavLinks username={username} logout={logout} />
			</nav>
		</header>
	);
}
