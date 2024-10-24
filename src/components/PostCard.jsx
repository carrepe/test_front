import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import style from "../styles/PostCard.module.css";

const API_URL = import.meta.env.VITE_API_URL;

// 자주 사용하는 날짜 포맷팅 함수를 커스텀 훅으로 분리하여 재사용해보세요
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

// 컴포넌트의 불필요한 리렌더링을 방지하여 성능을 최적화하기 위해 React.memo 사용

// PostCard가 리렌더링될 때마다 이 컴포넌트들도 함께 리렌더링될 수 있습니다.
// React.memo를 사용함으로써, 이 컴포넌트들의 props가 변경되지 않았다면 불필요한 리렌더링을 방지합니다.
// LikeButton.js, AuthorLink.js PostImage.js 로 분리하여 재사용해보세요
const LikeButton = React.memo(function LikeButton({
	isLiked,
	likeCount,
	onClick,
}) {
	return (
		<p onClick={onClick}>
			<span className={`${style.heart} ${isLiked ? style.liked : ""}`}>
				❤️
			</span>
			<span>{likeCount}</span>
		</p>
	);
});

const AuthorLink = React.memo(function AuthorLink({ author }) {
	return (
		<Link
			to={`/userpage/${author}`}
			onClick={(e) => e.stopPropagation()}
			className={style.author}
		>
			{author}
		</Link>
	);
});

const PostImage = React.memo(function PostImage({ cover }) {
	return (
		<div className={style.post_img}>
			<img src={`${API_URL}/${cover}`} alt="" />
		</div>
	);
});

export default function PostCard({ post }) {
	const user = useSelector((state) => state.user.user);
	const [isLiked, setIsLiked] = useState(
		user && post.likes?.includes(user.id)
	);
	const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
	const navigate = useNavigate();

	const goDetail = useCallback(() => {
		navigate(`/detail/${post._id}`);
	}, [navigate, post._id]);

	const handleLikeClick = useCallback(
		async (e) => {
			e.stopPropagation();
			if (!user || user === "토큰없음") {
				alert("로그인이 필요합니다.");
				return;
			}

			try {
				const response = await fetch(
					`${API_URL}/posts/like/${post._id}`,
					{
						method: "POST",
						credentials: "include",
					}
				);

				if (response.ok) {
					const updatedPost = await response.json();
					setIsLiked((prev) => !prev);
					setLikeCount(updatedPost.likes.length);
				} else {
					console.error("Failed to update like");
				}
			} catch (error) {
				console.error("Error updating like:", error);
			}
		},
		[user, post._id]
	);

	const formattedDate = useMemo(
		() => formatDate(post.createdAt),
		[post.createdAt]
	);

	return (
		<article className={style.PostCard} onClick={goDetail}>
			<div className={style.post_text}>
				<h2 className={style.__title}>{post.title}</h2>
				<p className={style.__info}>
					<AuthorLink author={post.author} />
					<time className={style.date}>{formattedDate}</time>
				</p>
				<LikeButton
					isLiked={isLiked}
					likeCount={likeCount}
					onClick={handleLikeClick}
				/>
				<p>댓글 {post.commentCount}개</p>
				<p className={style.__dec}>{post.summary}</p>
			</div>
			<PostImage cover={post.cover} />
		</article>
	);
}
