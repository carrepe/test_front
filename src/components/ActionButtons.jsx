import style from "../styles/ActionButtons.module.css";
import { Link } from "react-router-dom";
export default function ActionButtons({ isAuthor, postId, onDelete }) {
	return (
		<section className={style.btns}>
			{isAuthor && (
				<>
					<Link to={`/edit/${postId}`}>수정</Link>
					<span onClick={onDelete}>삭제</span>
				</>
			)}
			<Link to="/">목록으로</Link>
		</section>
	);
}
