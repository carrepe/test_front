import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import style from "../styles/CommentSection.module.css";

export default function CommentSection({ postId }) {
	const user = useSelector((state) => state.user.user);
	const localUser = user.username;

	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState("");
	const [editingComment, setEditingComment] = useState(null);
	const [editContent, setEditContent] = useState("");

	useEffect(() => {
		fetchComments();
	}, [postId]);

	const fetchComments = async () => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/comments/${postId}`
			);
			const data = await response.json();
			setComments(data);
		} catch (error) {
			console.error("Error fetching comments:", error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!localUser || localUser === "인증 토큰이 없습니다.") {
			alert("댓글을 작성하려면 로그인해야 합니다.");
			return;
		}
		if (!newComment.trim()) {
			alert("댓글 내용을 입력해주세요.");
			return;
		}
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/comments`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						postId,
						content: newComment,
						author: localUser,
					}),
					credentials: "include",
				}
			);
			if (response.ok) {
				setNewComment("");
				fetchComments();
			} else {
				alert("댓글 등록에 실패했습니다.");
			}
		} catch (error) {
			console.error("Error posting comment:", error);
		}
	};

	const handleEdit = (comment) => {
		setEditingComment(comment._id);
		setEditContent(comment.content);
	};

	const handleUpdate = async (commentId) => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/comments/${commentId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						content: editContent,
					}),
					credentials: "include",
				}
			);
			if (response.ok) {
				setEditingComment(null);
				fetchComments();
			} else {
				alert("댓글 수정에 실패했습니다.");
			}
		} catch (error) {
			console.error("Error updating comment:", error);
		}
	};

	const handleDelete = async (commentId) => {
		if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/comments/${commentId}`,
					{
						method: "DELETE",
						credentials: "include",
					}
				);
				if (response.ok) {
					fetchComments();
				} else {
					alert("댓글 삭제에 실패했습니다.");
				}
			} catch (error) {
				console.error("Error deleting comment:", error);
			}
		}
	};

	return (
		<section className={style.commentSection}>
			{localUser && localUser !== "인증 토큰이 없습니다." ? (
				<form onSubmit={handleSubmit}>
					<textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder="댓글을 입력하세요"
					></textarea>
					<button type="submit">댓글 등록</button>
				</form>
			) : (
				<p className={style.logMessage}>
					댓글을 작성하려면 <Link to="/login">로그인</Link>이
					필요합니다.
				</p>
			)}
			<ul>
				{comments.map((comment) => (
					<li key={comment._id} className={style.list}>
						{editingComment === comment._id ? (
							<div className={style.commnet}>
								<textarea
									value={editContent}
									onChange={(e) =>
										setEditContent(e.target.value)
									}
								></textarea>
								<div>
									<button
										onClick={() =>
											handleUpdate(comment._id)
										}
									>
										수정 완료
									</button>
									<button
										onClick={() => setEditingComment(null)}
									>
										취소
									</button>
								</div>
							</div>
						) : (
							<div className={style.commnet}>
								<div>
									<span hidden>댓글 내용:</span>
									<p>{comment.content}</p>
									<span hidden>작성자:</span>
									<Link
										to={`/userpage/${comment.author}`}
										className={style.author}
									>
										{comment.author}
									</Link>
								</div>
								{localUser && localUser === comment.author && (
									<div>
										<button
											onClick={() => handleEdit(comment)}
										>
											수정
										</button>
										<button
											onClick={() =>
												handleDelete(comment._id)
											}
										>
											삭제
										</button>
									</div>
								)}
							</div>
						)}
					</li>
				))}
			</ul>
		</section>
	);
}
