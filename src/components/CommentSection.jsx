import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import style from "../styles/CommentSection.module.css";

export default function CommentSection({ postId }) {
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState("");
	const user = useSelector((state) => state.user.user);
	const username = user?.username || null;

	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		fetchComments();
	}, [postId]);

	const fetchComments = async () => {
		try {
			const response = await fetch(`${API_URL}/comments/${postId}`);
			if (response.ok) {
				const data = await response.json();
				setComments(data);
			}
		} catch (error) {
			console.error("Failed to fetch comments:", error);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "UTC",
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!username) {
			alert("댓글을 작성하려면 로그인이 필요합니다.");
			return;
		}

		if (!newComment.trim()) {
			alert("댓글 내용을 입력해주세요.");
			return;
		}

		try {
			const response = await fetch(`${API_URL}/comments/create`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: newComment.trim(),
					author: username,
					postId: postId,
				}),
				credentials: "include",
			});

			if (response.ok) {
				const result = await response.json();
				if (result) {
					setNewComment("");
					fetchComments();
				}
			} else {
				const error = await response.json();
				alert(error.message || "댓글 작성에 실패했습니다.");
			}
		} catch (error) {
			console.error("Failed to create comment:", error);
			alert("댓글 작성 중 오류가 발생했습니다.");
		}
	};

	const handleDelete = async (commentId) => {
		if (!username) {
			alert("권한이 없습니다.");
			return;
		}

		if (window.confirm("댓글을 삭제하시겠습니까?")) {
			try {
				const response = await fetch(
					`${API_URL}/comments/${commentId}`,
					{
						method: "DELETE",
						credentials: "include",
					}
				);

				if (response.ok) {
					fetchComments();
				} else {
					const error = await response.json();
					alert(error.message || "댓글 삭제에 실패했습니다.");
				}
			} catch (error) {
				console.error("Failed to delete comment:", error);
				alert("댓글 삭제 중 오류가 발생했습니다.");
			}
		}
	};

	return (
		<section className={style.CommentSection}>
			<h3>댓글</h3>
			<form onSubmit={handleSubmit} className={style.commentForm}>
				<textarea
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					placeholder={
						username
							? "댓글을 입력하세요..."
							: "댓글을 작성하려면 로그인이 필요합니다."
					}
					disabled={!username}
				/>
				<button type="submit" disabled={!username}>
					댓글 작성
				</button>
			</form>
			<div className={style.commentList}>
				{comments.length === 0 ? (
					<p className={style.noComments}>아직 댓글이 없습니다.</p>
				) : (
					comments.map((comment) => (
						<div key={comment._id} className={style.comment}>
							<div className={style.commentContent}>
								<div className={style.commentHeader}>
									<span className={style.author}>
										{comment.author}
									</span>
									<span className={style.date}>
										{formatDate(comment.createdAt)}
									</span>
								</div>
								<p className={style.content}>
									{comment.content}
								</p>
							</div>
							{username === comment.author && (
								<button
									onClick={() => handleDelete(comment._id)}
									className={style.deleteButton}
								>
									삭제
								</button>
							)}
						</div>
					))
				)}
			</div>
		</section>
	);
}
