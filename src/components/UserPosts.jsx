import style from "../styles/UserPosts.module.css";
import { Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function UserPosts({ posts }) {
	return (
		<ul className={style.userPosts}>
			{posts.map((post) => (
				<li key={post._id}>
					<Link to={`/detail/${post._id}`}>
						<div className={style.img}>
							<img src={`${API_URL}${post.cover}`} alt="" />
						</div>
						<div className={style.info}>
							<span>댓글: {post.commentCount}</span>
							<span>❤️ {post.likeCount}</span>
						</div>
					</Link>
				</li>
			))}
		</ul>
	);
}
