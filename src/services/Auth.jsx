import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserAllInfo } from "../store/userStore";

function Auth() {
	const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
	const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
	const API_URL = import.meta.env.VITE_API_URL;

	const navigate = useNavigate();
	const dispatch = useDispatch();

	const getToken = async (code) => {
		if (!code) {
			throw new Error("인증코드가 없습니다.");
		}

		try {
			const response = await fetch(
				"https://kauth.kakao.com/oauth/token",
				{
					method: "POST",
					headers: {
						"Content-Type":
							"application/x-www-form-urlencoded;charset=utf-8",
					},
					body: new URLSearchParams({
						grant_type: "authorization_code",
						client_id: REST_API_KEY,
						redirect_uri: REDIRECT_URI,
						code: code,
					}),
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`토큰 받아오기 실패: ${errorText}`);
			}

			const data = await response.json();
			console.log("카카오 토큰 데이터:", data);
			return data;
		} catch (error) {
			console.error("토큰 요청 에러:", error);
			throw error;
		}
	};

	const loginWithKakao = async (access_token) => {
		try {
			console.log("카카오 로그인 시도:", access_token);

			const response = await fetch(`${API_URL}/auth/kakao/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ access_token }),
			});

			const data = await response.json();
			console.log("서버 응답:", data);

			if (!response.ok) {
				throw new Error(data.message || "카카오 로그인 실패");
			}

			if (data.success && data.user) {
				console.log("로그인 성공, 유저 정보:", data.user);
				dispatch(setUserAllInfo(data.user));
				return true;
			}

			return false;
		} catch (error) {
			console.error("카카오 로그인 에러:", error);
			throw error;
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const code = new URL(window.location.href).searchParams.get(
					"code"
				);
				console.log("카카오 인증 코드:", code);

				if (!code) {
					console.error("인증코드가 없습니다.");
					navigate("/login");
					return;
				}

				const tokenData = await getToken(code);

				if (!tokenData?.access_token) {
					throw new Error("액세스 토큰을 받아오지 못했습니다.");
				}

				const loginSuccess = await loginWithKakao(
					tokenData.access_token
				);

				if (loginSuccess) {
					console.log("로그인 성공, 메인 페이지로 이동");
					navigate("/");
				} else {
					console.error("로그인 실패");
					navigate("/login");
				}
			} catch (err) {
				console.error("인증 처리 에러:", err);
				navigate("/login");
			}
		};

		fetchData();
	}, [navigate, dispatch]);

	return (
		<div className="flex justify-center items-center min-h-screen">
			<div className="text-center">
				<h2 className="text-xl font-bold mb-4">
					카카오 로그인 처리 중...
				</h2>
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
			</div>
		</div>
	);
}

export default Auth;
