import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import style from "../styles/UserPage.module.css";
import UserImage from "../components/UserImage";
import UserPosts from "../components/UserPosts";
import UserInfo from "../components/UserInfo";

const API_URL = import.meta.env.VITE_API_URL;

// 커스텀훅은 파일을 분리하여 사용해 보세요.
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

export default function UserPage() {
	const { userinfo } = useParams();
	const loginUser = useSelector((state) => state.user.user?.username);

	const {
		data: userData,
		loading: userLoading,
		error: userError,
	} = useFetch(`${API_URL}/users/${userinfo}`);

	const {
		data: postsData,
		loading: postsLoading,
		error: postsError,
	} = useFetch(`${API_URL}/posts/user-posts/${userinfo}`);

	if (userLoading || postsLoading) return <div>Loading...</div>;
	if (userError || postsError)
		return <div>Error: {userError || postsError}</div>;
	if (!userData) return <div>User not found</div>;

	return (
		<section className={style.UserPage}>
			<h2>UserPage</h2>
			<UserImage
				userImage={userData.userImage}
				username={userData.username}
			/>
			<UserInfo username={userData.username} loginUser={loginUser} />
			<UserPosts posts={postsData} />
		</section>
	);
}
