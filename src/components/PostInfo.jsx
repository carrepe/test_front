import style from "../styles/PostInfo.module.css";
import { Link } from "react-router-dom";

export default function PostInfo({ author, createdAt }) {
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "utc",
		});
	};
	return (
		<div className={style.info}>
			<p>
				작성자:{" "}
				<Link to={`/userpage/${author}`} className={style.author}>
					{author}
				</Link>
			</p>
			<p>작성일: {formatDate(createdAt)}</p>
		</div>
	);
}
