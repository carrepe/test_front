import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import style from "../styles/PostDetailPage.module.css";
import CommentSection from "../components/CommentSection";
import PostImage from "../components/PostImage";
import PostInfo from "../components/PostInfo";
import PostContent from "../components/PostContent";
import ActionButtons from "../components/ActionButtons";

const API_URL = import.meta.env.VITE_API_URL;

// 커스텀 훅으로 분리하여 재사용해보세요
const useFetch = (url) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = useCallback(async () => {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("Failed to fetch data");
			}
			const result = await response.json();
			setData(result);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	}, [url]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, error, refetch: fetchData };
};

export default function PostDetailPage() {
	const { postId } = useParams();
	const navigate = useNavigate();
	const userName = useSelector((state) => state.user.user?.username);

	const {
		data: postInfo,
		loading,
		error,
	} = useFetch(`${API_URL}posts/postDetail/${postId}`);

	const deletePost = useCallback(async () => {
		try {
			const response = await fetch(
				`${API_URL}posts/deletePost/${postId}`,
				{
					method: "DELETE",
				}
			);
			const data = await response.json();
			if (data.message === "ok") {
				alert("삭제되었습니다.");
				navigate("/");
			}
		} catch (error) {
			console.error("Error deleting post:", error);
			alert("삭제 중 오류가 발생했습니다.");
		}
	}, [postId, navigate]);

	if (loading) return <div>로딩 중...</div>;
	if (error) return <div>에러: {error}</div>;
	if (!postInfo) return <div>포스트를 찾을 수 없습니다.</div>;

	return (
		<section className={style.PostDetailPage}>
			<h2>블로그 상세 페이지</h2>
			<section>
				<PostImage cover={postInfo.cover} title={postInfo.title} />
				<PostInfo
					author={postInfo.author}
					createdAt={postInfo.createdAt}
				/>
				<PostContent
					summary={postInfo.summary}
					content={postInfo.content}
				/>
			</section>
			<ActionButtons
				isAuthor={userName === postInfo.author}
				postId={postId}
				onDelete={deletePost}
			/>
			<CommentSection postId={postId} />
		</section>
	);
}
