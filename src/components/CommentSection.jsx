import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import style from "../styles/CommentSection.module.css";

const API_URL = import.meta.env.VITE_API_URL;

// 커스텀 훅으로 파일 분리해서 재사용 해보세요
// useComments.js로 분리하여 재사용해보세요
const useComments = (postId) => {
	const [comments, setComments] = useState([]);

	const fetchComments = useCallback(async () => {
		try {
			const response = await fetch(`${API_URL}/comments/${postId}`);
			const data = await response.json();
			setComments(data);
		} catch (error) {
			console.error("Error fetching comments:", error);
		}
	}, [postId]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	return { comments, fetchComments };
};

// 컴포넌트의 불필요한 리렌더링을 방지하여 성능을 최적화하기 위해 React.memo 사용
// 새 댓글이 추가되거나 다른 댓글이 수정될 때 변경되지 않은 댓글들은 리렌더링되지 않습니다
// CommentForm.js로 분리하여 재사용해보세요
const CommentForm = React.memo(function CommentForm({
	postId,
	localUser,
	onCommentAdded,
}) {
	const [newComment, setNewComment] = useState("");

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
			const response = await fetch(`${API_URL}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					postId,
					content: newComment,
					author: localUser,
				}),
				credentials: "include",
			});
			if (response.ok) {
				setNewComment("");
				onCommentAdded();
			} else {
				alert("댓글 등록에 실패했습니다.");
			}
		} catch (error) {
			console.error("Error posting comment:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<textarea
				value={newComment}
				onChange={(e) => setNewComment(e.target.value)}
				placeholder="댓글을 입력하세요"
			/>
			<button type="submit">댓글 등록</button>
		</form>
	);
});

// Comment.js로 분리하여 재사용해보세요
const Comment = React.memo(function Comment({
	comment,
	localUser,
	onUpdate,
	onDelete,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);

	const handleUpdate = async () => {
		try {
			const response = await fetch(`${API_URL}/comments/${comment._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: editContent }),
				credentials: "include",
			});
			if (response.ok) {
				setIsEditing(false);
				onUpdate();
			} else {
				alert("댓글 수정에 실패했습니다.");
			}
		} catch (error) {
			console.error("Error updating comment:", error);
		}
	};

	return (
		<li className={style.list}>
			{isEditing ? (
				<div className={style.commnet}>
					<textarea
						value={editContent}
						onChange={(e) => setEditContent(e.target.value)}
					/>
					<div>
						<button onClick={handleUpdate}>수정 완료</button>
						<button onClick={() => setIsEditing(false)}>
							취소
						</button>
					</div>
				</div>
			) : (
				<div className={style.commnet}>
					<div>
						<p>{comment.content}</p>
						<Link
							to={`/userpage/${comment.author}`}
							className={style.author}
						>
							{comment.author}
						</Link>
					</div>
					{localUser === comment.author && (
						<div>
							<button onClick={() => setIsEditing(true)}>
								수정
							</button>
							<button onClick={() => onDelete(comment._id)}>
								삭제
							</button>
						</div>
					)}
				</div>
			)}
		</li>
	);
});

export default function CommentSection({ postId }) {
	const user = useSelector((state) => state.user.user);
	const localUser = user.username;
	const { comments, fetchComments } = useComments(postId);

	const handleDelete = useCallback(
		async (commentId) => {
			if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
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
						alert("댓글 삭제에 실패했습니다.");
					}
				} catch (error) {
					console.error("Error deleting comment:", error);
				}
			}
		},
		[fetchComments]
	);

	return (
		<section className={style.commentSection}>
			{localUser && localUser !== "인증 토큰이 없습니다." ? (
				<CommentForm
					postId={postId}
					localUser={localUser}
					onCommentAdded={fetchComments}
				/>
			) : (
				<p className={style.logMessage}>
					댓글을 작성하려면 <Link to="/login">로그인</Link>이
					필요합니다.
				</p>
			)}
			<ul>
				{comments.map((comment) => (
					<Comment
						key={comment._id}
						comment={comment}
						localUser={localUser}
						onUpdate={fetchComments}
						onDelete={handleDelete}
					/>
				))}
			</ul>
		</section>
	);
}
