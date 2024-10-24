import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import style from "../styles/UserPage.module.css";
import PasswordFields from "../components/PasswordFields";
import UserImageInput from "../components/UserImageInput";

const API_URL = import.meta.env.VITE_API_URL;

// 커스텀 훅으로 분리하여 재사용해보세요
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

	return [values, handleChange, setValues, errors, setErrors];
};

const fetchUserInfo = async (userName) => {
	const response = await fetch(`${API_URL}/users/${userName}`);
	if (!response.ok) {
		throw new Error("Failed to fetch user info");
	}
	return response.json();
};

const updateUserInfo = async (userName, formData) => {
	const response = await fetch(`${API_URL}/users/${userName}`, {
		method: "PUT",
		body: formData,
		credentials: "include",
	});
	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message || "Failed to update user info");
	}
	return response.json();
};

export default function EditUserPage() {
	const navigate = useNavigate();
	const userName = useSelector((state) => state.user.user?.username);
	const [
		{ currentPassword, newPassword, passwordCheck, userImage },
		handleChange,
		errors,
		setErrors,
	] = useForm({
		currentPassword: "",
		newPassword: "",
		passwordCheck: "",
		userImage: null,
	});
	const [previewImage, setPreviewImage] = useState(null);

	useEffect(() => {
		const loadUserInfo = async () => {
			if (userName) {
				try {
					const data = await fetchUserInfo(userName);
					if (data.userImage) {
						setPreviewImage(`${API_URL}/uploads/${data.userImage}`);
					}
				} catch (error) {
					console.error("Error fetching user info:", error);
					setErrors((prev) => ({ ...prev, fetch: error.message }));
				}
			}
		};
		loadUserInfo();
	}, [userName, setErrors]);

	const handleImageChange = useCallback(
		(e) => {
			handleChange(e);
			if (e.target.files[0]) {
				setPreviewImage(URL.createObjectURL(e.target.files[0]));
			}
		},
		[handleChange]
	);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = {};
		if (newPassword && newPassword.length < 4) {
			newErrors.newPassword = "새 비밀번호는 4자 이상이어야 합니다.";
		}
		if (newPassword !== passwordCheck) {
			newErrors.passwordCheck =
				"새 비밀번호와 비밀번호 확인이 일치하지 않습니다.";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		const formData = new FormData();
		formData.set("password", currentPassword);
		if (newPassword) {
			formData.set("newpassword", newPassword);
		}
		if (userImage) {
			formData.set("userImage", userImage);
		}

		try {
			await updateUserInfo(userName, formData);
			alert("사용자 정보가 성공적으로 업데이트되었습니다.");
			navigate(`/userpage/${userName}`);
		} catch (error) {
			console.error("Error updating user info:", error);
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
				<PasswordFields
					currentPassword={currentPassword}
					newPassword={newPassword}
					passwordCheck={passwordCheck}
					handleChange={handleChange}
				/>
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
