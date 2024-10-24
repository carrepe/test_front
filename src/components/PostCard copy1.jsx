import { Link } from "react-router-dom";
import style from "../styles/PostCard.module.css";
import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function PostCard({ post }) {
	console.log("----", post);

	const user = useSelector((state) => state.user.user);
	const [isLiked, setIsLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(
		post.likes ? post.likes.length : 0
	);
	console.log("user", user);

	const navigate = useNavigate();
	const goDetail = () => {
		navigate(`/detail/${post._id}`);
	};
	const handleAuthorClick = (e) => {
		e.stopPropagation();
	};

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

	useEffect(() => {
		if (user && post.likes) {
			setIsLiked(post.likes.includes(user.id));
		}
	}, [user, post.likes]);

	const handleLikeClick = async (e) => {
		e.stopPropagation();
		if (user === "토큰없음") {
			alert("로그인이 필요합니다.");
			return;
		}

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/like/${post._id}`,
				{
					method: "POST",
					credentials: "include",
				}
			);

			if (response.ok) {
				const updatedPost = await response.json();
				setIsLiked(!isLiked);
				setLikeCount(updatedPost.likes.length);
				// if (onLikeUpdate) onLikeUpdate(updatedPost);
			} else {
				console.error("Failed to update like");
			}
		} catch (error) {
			console.error("Error updating like:", error);
		}
	};

	return (
		<article className={style.PostCard} onClick={goDetail}>
			<div className={style.post_text}>
				<h2 className={style.__title}>{post.title}</h2>
				<p className={style.__info}>
					<Link
						to={`/userpage/${post.author}`}
						onClick={handleAuthorClick}
						className={style.author}
					>
						{post.author}
					</Link>
					<time className={style.date}>
						{formatDate(post.createdAt)}
					</time>
				</p>
				<p onClick={handleLikeClick}>
					<span
						className={`${style.heart} ${
							isLiked ? style.liked : ""
						}`}
					>
						❤️
					</span>
					<span>{likeCount}</span>
				</p>
				<p>댓글 {post.commentCount}개</p>
				<p className={style.__dec}>{post.summary}</p>
			</div>
			<div className={style.post_img}>
				<img
					src={`${import.meta.env.VITE_API_URL}/${post.cover}`}
					alt=""
				/>
			</div>
		</article>
	);
}
