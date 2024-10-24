import style from "../styles/MainPage.module.css";
import PostCard from "../components/PostCard";
import { useEffect, useState, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const LoadingSpinner = () => <p>로딩 중...</p>;
const NoPostMessage = () => (
	<p className={style.noPostMessage}>첫번째 글의 주인공이 되어주세요</p>
);

export default function MainPage() {
	const [postList, setPostList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const getPostList = async () => {
			try {
				const response = await fetch(`${API_URL}/posts/postList`);
				if (!response.ok) {
					throw new Error("백엔드통신오류");
				}
				const data = await response.json();
				setPostList(data);
			} catch (error) {
				console.error("백엔드통신오류 메시지확인:", error);
				setError(error.message);
			} finally {
				setIsLoading(false);
			}
		};

		getPostList();
	}, []);

	const renderedPosts = useMemo(
		() => postList.map((post) => <PostCard key={post._id} post={post} />),
		[postList]
	);

	if (isLoading) return <LoadingSpinner />;
	if (error) return <p>Error: {error}</p>;

	return (
		<section className={style.MainPage}>
			{postList.length > 0 ? renderedPosts : <NoPostMessage />}
		</section>
	);
}
