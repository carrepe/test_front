import style from "../styles/MainPage.module.css";
import PostCard from "../components/PostCard";
import { useEffect, useState, useCallback, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const LoadingSpinner = () => (
	<div className={style.loadingSpinner}>
		<p>로딩 중...</p>
	</div>
);

const NoPostMessage = () => (
	<p className={style.noPostMessage}>첫번째 글의 주인공이 되어주세요</p>
);

export default function MainPage() {
	const [postList, setPostList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [totalPosts, setTotalPosts] = useState(0);
	const observerTarget = useRef(null);
	const loadedPostIds = useRef(new Set());

	const loadPosts = useCallback(async () => {
		if (!hasMore || isLoadingMore) {
			return;
		}

		try {
			setIsLoadingMore(true);
			console.log(`Loading page ${page}`);

			const response = await fetch(
				`${API_URL}/posts/postList?page=${page}&limit=10`
			);

			if (!response.ok) {
				throw new Error("백엔드통신오류");
			}

			const data = await response.json();
			console.log("Received data:", data); // 데이터 확인용 로그

			// 중복 제거 및 새 포스트 필터링
			const newPosts = data.posts.filter((post) => {
				if (loadedPostIds.current.has(post._id)) {
					return false;
				}
				loadedPostIds.current.add(post._id);
				return true;
			});

			if (newPosts.length > 0) {
				setPostList((prev) => {
					const combined = [...prev, ...newPosts];
					// ID 기준으로 중복 제거
					const uniquePosts = Array.from(
						new Map(
							combined.map((post) => [post._id, post])
						).values()
					);
					return uniquePosts;
				});
				setPage((p) => p + 1);
			}

			setTotalPosts(data.total);

			// hasMore 상태 업데이트 수정
			// 현재 로드된 게시물 수가 전체 게시물 수보다 작은 경우에만 true
			const currentTotal = postList.length + newPosts.length;
			setHasMore(currentTotal < data.total);

			console.log({
				currentTotal,
				totalPosts: data.total,
				hasMore: currentTotal < data.total,
			});
		} catch (error) {
			console.error("데이터 로드 에러:", error);
			setError(error.message);
		} finally {
			setIsLoadingMore(false);
			setIsLoading(false);
		}
	}, [page, hasMore, postList.length]);

	// 초기 데이터 로드
	useEffect(() => {
		loadPosts();
	}, []);

	// Intersection Observer 설정
	useEffect(() => {
		if (!observerTarget.current || !hasMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				console.log("Intersection:", {
					isIntersecting: entry.isIntersecting,
					hasMore,
					isLoadingMore,
					currentPosts: postList.length,
					totalPosts,
				});

				if (entry.isIntersecting && hasMore && !isLoadingMore) {
					loadPosts();
				}
			},
			{
				root: null,
				rootMargin: "200px", // 하단에서 더 일찍 감지하도록 수정
				threshold: 0.1,
			}
		);

		observer.observe(observerTarget.current);

		return () => observer.disconnect();
	}, [loadPosts, hasMore, isLoadingMore, postList.length, totalPosts]);

	// 포스트 렌더링
	const renderPosts = useCallback(() => {
		return postList.map((post) => <PostCard key={post._id} post={post} />);
	}, [postList]);

	if (error) return <p>Error: {error}</p>;
	if (!postList.length && isLoading) return <LoadingSpinner />;

	return (
		<section className={style.MainPage}>
			{postList.length > 0 ? (
				<>
					{renderPosts()}
					<div
						ref={observerTarget}
						className={style.loadMoreTrigger}
						style={{
							width: "100%",
							height: "100px",
							margin: "20px 0",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						{isLoadingMore && <LoadingSpinner />}
						{!hasMore && postList.length === totalPosts && (
							<p>
								모든 게시물을 불러왔습니다. (총 {totalPosts}개)
							</p>
						)}
					</div>
				</>
			) : (
				<NoPostMessage />
			)}
		</section>
	);
}
