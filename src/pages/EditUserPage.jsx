import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import style from "../styles/UserPage.module.css";
import PasswordFields from "../components/PasswordFields";
import UserImageInput from "../components/UserImageInput";

const API_URL = import.meta.env.VITE_API_URL;

const useForm = (initialState) => {
	const [values, setValues] = useState(initialState);
	const [errors, setErrors] = useState({});

	const handleChange = useCallback((e) => {
		const { name, value, type, files } = e.target;
		setValues((prev) => ({
			...prev,
			[name]: type === "file" ? files[0] : value,
		}));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	}, []);

	return {
		values,
		handleChange,
		setValues,
		errors,
		setErrors,
	};
};

const fetchUserInfo = async (userName) => {
	const response = await fetch(`${API_URL}/users/${userName}`);
	if (!response.ok) {
		throw new Error("사용자 정보를 가져오는데 실패했습니다");
	}
	return response.json();
};

const updateUserInfo = async (userName, formData) => {
	const response = await fetch(`${API_URL}/users/${userName}`, {
		method: "PUT",
		body: formData,
		credentials: "include",
	});

	const data = await response.json();
	if (!response.ok) {
		throw new Error(
			data.message || "사용자 정보를 수정하는데 실패했습니다"
		);
	}
	return data;
};

export default function EditUserPage() {
	const navigate = useNavigate();
	const userName = useSelector((state) => state.user.user?.username);
	const [isKakaoUser, setIsKakaoUser] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);

	const {
		values: { currentPassword, newPassword, passwordCheck, userImage },
		handleChange,
		errors,
		setErrors,
	} = useForm({
		currentPassword: "",
		newPassword: "",
		passwordCheck: "",
		userImage: null,
	});

	useEffect(() => {
		const loadUserInfo = async () => {
			if (userName) {
				try {
					const data = await fetchUserInfo(userName);
					if (data.userImage) {
						setPreviewImage(
							data.userImage.includes("kakaocdn.net")
								? data.userImage
								: `${API_URL}/uploads/${data.userImage}`
						);
					}
					// 카카오 사용자 확인
					setIsKakaoUser(userName.startsWith("kakao_"));
				} catch (error) {
					console.error("사용자정보 가져오는데 실패했습니다:", error);
					setErrors((prev) => ({ ...prev, fetch: error.message }));
				}
			}
		};
		loadUserInfo();
	}, [userName]);

	const handleImageChange = useCallback(
		(e) => {
			handleChange(e);
			if (e.target.files[0]) {
				setPreviewImage(URL.createObjectURL(e.target.files[0]));
			}
		},
		[handleChange]
	);

	const validateForm = () => {
		const newErrors = {};

		if (!isKakaoUser && !currentPassword) {
			newErrors.currentPassword = "현재 비밀번호를 입력해주세요.";
		}

		if (newPassword) {
			if (newPassword.length < 4) {
				newErrors.newPassword = "새 비밀번호는 4자 이상이어야 합니다.";
			}
			if (newPassword !== passwordCheck) {
				newErrors.passwordCheck =
					"새 비밀번호와 비밀번호 확인이 일치하지 않습니다.";
			}
		}

		return newErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const validationErrors = validateForm();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		const formData = new FormData();

		// 카카오 사용자가 아닌 경우에만 현재 비밀번호 검증
		if (!isKakaoUser) {
			formData.set("password", currentPassword);
		}

		if (newPassword) {
			formData.set("newpassword", newPassword);
		}

		if (userImage) {
			formData.set("userImage", userImage);
		}

		// 카카오 사용자 여부 전달
		formData.set("isKakaoUser", isKakaoUser);

		try {
			await updateUserInfo(userName, formData);
			alert("사용자 정보가 성공적으로 업데이트되었습니다.");
			navigate(`/userpage/${userName}`);
		} catch (error) {
			console.error("사용자정보 수정하는데 실패했습니다:", error);
			setErrors((prev) => ({ ...prev, submit: error.message }));
		}
	};

	return (
		<section className={style.UserPage}>
			<h2>사용자 정보 수정</h2>
			{errors.fetch && <p className={style.error}>{errors.fetch}</p>}
			<form onSubmit={handleSubmit}>
				<p>{userName}님의 정보입니다</p>
				<UserImageInput
					previewImage={previewImage}
					userName={userName}
					handleImageChange={handleImageChange}
				/>
				<hr />
				{!isKakaoUser && (
					<PasswordFields
						currentPassword={currentPassword}
						newPassword={newPassword}
						passwordCheck={passwordCheck}
						handleChange={handleChange}
					/>
				)}
				{errors.currentPassword && (
					<p className={style.error}>{errors.currentPassword}</p>
				)}
				{errors.newPassword && (
					<p className={style.error}>{errors.newPassword}</p>
				)}
				{errors.passwordCheck && (
					<p className={style.error}>{errors.passwordCheck}</p>
				)}
				{errors.submit && (
					<p className={style.error}>{errors.submit}</p>
				)}
				<button type="submit">수정하기</button>
			</form>
		</section>
	);
}
