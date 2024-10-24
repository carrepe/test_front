import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PostDetailPage from "./pages/PostDetailPage";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import UserPage from "./pages/UserPage";
import EditUserPage from "./pages/EditUserPage";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Layout />}>
				<Route index element={<MainPage />} />
				<Route path="login" element={<LoginPage />} />
				<Route path="register" element={<RegisterPage />} />
				<Route path="detail/:postId" element={<PostDetailPage />} />
				<Route path="create" element={<CreatePost />} />
				<Route path="edit/:postId" element={<EditPost />} />
				<Route path="userpage/:userinfo" element={<UserPage />} />
				<Route
					path="/updataUserInfo/:userinfo"
					element={<EditUserPage />}
				/>
			</Route>
			<Route
				path="*"
				element={
					<div className="nopage">
						? <br />
						없는 페이지 입니다
					</div>
				}
			/>
		</Routes>
	);
}
