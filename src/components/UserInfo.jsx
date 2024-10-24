import style from "../styles/UserInfo.module.css";
import { Link } from "react-router-dom";
export default function UserInfo({ username, loginUser }) {
	return (
		<>
			<div>{username}님의 정보입니다</div>
			{username === loginUser && (
				<div className={style.btns}>
					<Link to={`/updataUserInfo/${loginUser}`}>
						회원정보수정
					</Link>
					<span>회원탈퇴</span>
				</div>
			)}
		</>
	);
}
