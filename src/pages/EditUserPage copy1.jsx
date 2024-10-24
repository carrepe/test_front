import { useEffect, useState } from "react";
import style from "../styles/UserPage.module.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function EditUserPage() {
	const navigate = useNavigate();
	const user = useSelector((state) => state.user.user);
	const userName = user?.username;

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [passwordCheck, setPasswordCheck] = useState("");
	const [userImage, setUserImage] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);

	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/userpage/${userName}`
				);
				const data = await response.json();
				if (data.userImage) {
					setPreviewImage(
						`${import.meta.env.VITE_API_URL}/uploads/${
							data.userImage
						}`
					);
				}
			} catch (error) {
				console.error("Error fetching user info:", error);
			}
		};
		if (userName) {
			fetchUserInfo();
		}
	}, [userName]);

	const handleImageChange = (e) => {
		if (e.target.files[0]) {
			setUserImage(e.target.files[0]);
			setPreviewImage(URL.createObjectURL(e.target.files[0]));
		}
	};

	const updateUserInfo = async (e) => {
		e.preventDefault();
		if (newPassword && newPassword.length < 4) {
			alert("새 비밀번호는 4자 이상이어야 합니다.");
			return;
		}
		if (newPassword !== passwordCheck) {
			alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
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
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/updataUserInfo/${userName}`,
				{
					method: "PUT",
					body: formData,
					credentials: "include",
				}
			);
			const data = await response.json();
			if (response.ok) {
				alert("사용자 정보가 성공적으로 업데이트되었습니다.");
				navigate(`/userpage/${userName}`);
			} else {
				alert(data.message || "수정에 실패했습니다.");
			}
		} catch (error) {
			console.error("Error updating user info:", error);
			alert("수정 중 오류가 발생했습니다.");
		}
	};

	return (
		<section className={style.UserPage}>
			<h2>사용자 정보 수정</h2>
			<form onSubmit={updateUserInfo}>
				<p>{userName}님의 정보입니다</p>
				<div className={style.userimg}>
					<img
						src={previewImage || "/user-profile.png"}
						alt={userName}
					/>
				</div>
				<label htmlFor="userImage">프로필 사진 변경</label>
				<input
					type="file"
					id="userImage"
					name="userImage"
					onChange={handleImageChange}
				/>

				<hr />
				<label htmlFor="currentPassword">현재 비밀번호</label>
				<input
					type="password"
					id="currentPassword"
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
					required
				/>

				<label htmlFor="newPassword">새 비밀번호</label>
				<input
					type="password"
					id="newPassword"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
				/>

				<label htmlFor="passwordCheck">새 비밀번호 확인</label>
				<input
					type="password"
					id="passwordCheck"
					value={passwordCheck}
					onChange={(e) => setPasswordCheck(e.target.value)}
				/>

				<button type="submit">수정하기</button>
			</form>
		</section>
	);
}
