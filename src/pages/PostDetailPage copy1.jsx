import style from "../styles/PostDetailPage.module.css";
// Toast UI Editor
import { Viewer } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import CommentSection from "../components/CommentSection";

export default function PostDetailPage() {
	// 로그인한 사용자가 작성자와 같은 경우 수정, 삭제 버튼이 보이게 하기 위해
	// user 정보를 store에서 가져옴
	const user = useSelector((state) => state.user.user);
	const userName = user?.username;

	const { postId } = useParams();

	const [postInfo, setPostInfo] = useState();
	const [formattedDate, setFormattedDate] = useState("");

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
		const fetchPostDetail = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/postDetail/${postId}`
				);
				const data = await response.json();
				console.log(data);

				setPostInfo(data);
				setFormattedDate(formatDate(data.createdAt));
			} catch (error) {
				console.error("Error fetching post detail:", error);
			}
		};

		fetchPostDetail();
	}, [postId]);

	// 글 삭제
	const deletePost = () => {
		fetch(`${import.meta.env.VITE_API_URL}/deletePost/${postId}`, {
			method: "DELETE",
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.message === "ok") {
					alert("삭제되었습니다.");
					window.location.href = "/";
				}
			});
	};

	if (!postInfo) {
		return <div>로딩 중...</div>;
	}

	return (
		<section className={style.PostDetailPage}>
			<h2>블로그 상세 페이지</h2>
			<section>
				<div className={style.detailimg}>
					<img
						src={`${import.meta.env.VITE_API_URL}/${
							postInfo?.cover
						}`}
						alt=""
					/>
					<h3>{postInfo?.title}</h3>
				</div>
				<div className={style.info}>
					<p>
						작성자:{" "}
						<Link
							to={`/userpage/${postInfo.author}`}
							className={style.author}
						>
							{postInfo.author}
						</Link>
					</p>
					<p>작성일: {formattedDate}</p>
				</div>
				<div className={style.summary}>{postInfo.summary}</div>
				<div className={style.desc}>
					<Viewer initialValue={postInfo.content} />
				</div>
			</section>

			<section className={style.btns}>
				{/* 로그인한 사용자만 글을 수정, 삭제할 수 있습니다. */}
				{userName === postInfo?.author && (
					<>
						<Link to={`/edit/${postId}`}>수정</Link>
						<span onClick={deletePost}>삭제</span>
					</>
				)}
				<Link to="/">목록으로</Link>
			</section>

			<CommentSection postId={postId} />
		</section>
	);
}
