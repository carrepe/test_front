import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import style from "../styles/CreatePost.module.css";
import ToastEditor from "../components/ToastEditor";

const API_URL = import.meta.env.VITE_API_URL;

// 커스텀 훅으로 분리하여 재사용해보세요
const usePostForm = (initialState) => {
	const [values, setValues] = useState(initialState);

	const handleChange = useCallback((e) => {
		const { name, value, type, files } = e.target;
		setValues((prev) => ({
			...prev,
			[name]: type === "file" ? files : value,
		}));
	}, []);

	return [values, handleChange, setValues];
};

const createPost = async (data) => {
	const response = await fetch(`${API_URL}/posts/postWrite`, {
		method: "POST",
		body: data,
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("글 등록에 실패했습니다.");
	}

	return response.json();
};

export default function CreatePost() {
	const [{ title, summary, files, content }, handleChange, setFormValues] =
		usePostForm({
			title: "",
			summary: "",
			files: "",
			content: "",
		});
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!title || !summary || !content) {
			setError("모든 필드를 입력해주세요.");
			return;
		}

		const data = new FormData();
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);
		if (files[0]) {
			data.append("files", files[0]);
		}

		try {
			await createPost(data);
			navigate("/");
		} catch (error) {
			console.error(error);
			setError(error.message || "글 등록 중 오류가 발생했습니다.");
		}
	};

	const handleEditorChange = useCallback(
		(value) => {
			setFormValues((prev) => ({ ...prev, content: value }));
		},
		[setFormValues]
	);

	return (
		<section className={style.CreatePost}>
			<h2>글 작성페이지</h2>
			<form className={style.writecom} onSubmit={handleSubmit}>
				<label htmlFor="title">제목</label>
				<input
					type="text"
					id="title"
					name="title"
					placeholder="제목을 입력해 주세요"
					value={title}
					onChange={handleChange}
				/>
				<label htmlFor="summary">요약내용</label>
				<input
					type="text"
					id="summary"
					name="summary"
					placeholder="요약내용을 입력해 주세요 100자 이내"
					value={summary}
					onChange={handleChange}
				/>
				<label htmlFor="files">파일첨부</label>
				<input
					type="file"
					id="files"
					name="files"
					onChange={handleChange}
				/>
				<label>내용</label>
				<ToastEditor
					initialValue={content}
					onChange={handleEditorChange}
				/>
				{error && <div className={style.error}>{error}</div>}
				<button type="submit">등록</button>
			</form>
		</section>
	);
}
