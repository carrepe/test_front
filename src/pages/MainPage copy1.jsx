import style from "../styles/MainPage.module.css";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";

export default function MainPage() {
	const [postList, setPostList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		getPostList();
	}, []);

	const getPostList = async () => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/postList`
			);
			const data = await response.json();
			setPostList(data);
		} catch (error) {
			console.error("Error fetching post list:", error);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<section className={style.MainPage}>
			{isLoading ? (
				<p>로딩 중...</p>
			) : postList.length > 0 ? (
				postList.map((post) => <PostCard key={post._id} post={post} />)
			) : (
				<p className={style.noPostMessage}>
					첫번째 글의 주인공이 되어주세요
				</p>
			)}
		</section>
	);
}
