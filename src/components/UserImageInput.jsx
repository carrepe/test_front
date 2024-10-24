export default function UserImageInput({
	previewImage,
	userName,
	handleImageChange,
}) {
	return (
		<div>
			<img src={previewImage || "/user-profile.png"} alt={userName} />
			<label htmlFor="userImage">프로필 사진 변경</label>
			<input
				type="file"
				id="userImage"
				name="userImage"
				onChange={handleImageChange}
			/>
		</div>
	);
}
