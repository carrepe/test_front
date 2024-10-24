import { useEffect, useState } from "react";
import style from "../styles/UserPage.module.css";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

export default function UserPage() {
	const user = useSelector((state) => state.user.user);
	const loginUser = user?.username;

	const { userinfo } = useParams();
	const [pageUser, setPageUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [userImage, setUserImage] = useState(null);
	const [userPosts, setUserPosts] = useState([]);

	useEffect(() => {
		const fetchUserData = async () => {
			setLoading(true);
			setError(null);
			try {
				const [userResponse, postsResponse] = await Promise.all([
					fetch(
						`${import.meta.env.VITE_API_URL}/userpage/${userinfo}`
					),
					fetch(
						`${import.meta.env.VITE_API_URL}/user-posts/${userinfo}`
					),
				]);

				if (!userResponse.ok || !postsResponse.ok) {
					throw new Error("Failed to fetch data");
				}

				const userData = await userResponse.json();
				const postsData = await postsResponse.json();

				setPageUser(userData);
				setUserImage(userData.userImage);
				setUserPosts(postsData);
			} catch (error) {
				console.error("Error fetching data:", error);
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};
		fetchUserData();
	}, [userinfo]); // userinfo가 변경될 때마다 실행

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!pageUser) return <div>User not found</div>;

	return (
		<section className={style.UserPage}>
			<h2>UserPage</h2>
			<div className={style.userimg}>
				{userImage ? (
					<img
						src={`${
							import.meta.env.VITE_API_URL
						}/uploads/${userImage}`}
						alt={pageUser.username}
					/>
				) : (
					<img src="/user-profile.png" alt={pageUser.username} />
				)}
			</div>
			<div>{pageUser.username}님의 정보입니다</div>

			{pageUser.username === loginUser ? (
				<div className={style.btns}>
					<Link to={`/updataUserInfo/${loginUser}`}>
						회원정보수정
					</Link>
					<span>회원탈퇴</span>
				</div>
			) : null}
			<hr />

			<ul className={style.userPosts}>
				{userPosts.map((post) => (
					<li key={post._id}>
						<Link to={`/detail/${post._id}`}>
							<div className={style.img}>
								<img
									src={`${import.meta.env.VITE_API_URL}/${
										post.cover
									}`}
									alt=""
								/>
							</div>
							<div className={style.info}>
								<span>댓글: {post.commentCount}</span>
								<span>❤️ {post.likeCount}</span>
							</div>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
