export default function PasswordFields({
	currentPassword,
	newPassword,
	passwordCheck,
	handleChange,
}) {
	return (
		<>
			<label htmlFor="currentPassword">현재 비밀번호</label>
			<input
				type="password"
				id="currentPassword"
				name="currentPassword"
				value={currentPassword}
				onChange={handleChange}
				required
			/>

			<label htmlFor="newPassword">새 비밀번호</label>
			<input
				type="password"
				id="newPassword"
				name="newPassword"
				value={newPassword}
				onChange={handleChange}
			/>

			<label htmlFor="passwordCheck">새 비밀번호 확인</label>
			<input
				type="password"
				id="passwordCheck"
				name="passwordCheck"
				value={passwordCheck}
				onChange={handleChange}
			/>
		</>
	);
}
