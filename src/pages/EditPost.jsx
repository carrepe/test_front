import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "../styles/CreatePost.module.css";
import ToastEditor from "../components/ToastEditor";

const API_URL = import.meta.env.VITE_API_URL;

// 커스텀 훅으로 분리하여 재사용해보세요
const useForm = (initialState) => {
	const [values, setValues] = useState(initialState);
	const [errors, setErrors] = useState({});

	const handleChange = useCallback((e) => {
		const { name, value, type, files } = e.target;
		setValues((prev) => ({
			...prev,
			[name]: type === "file" ? files : value,
		}));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	}, []);

	return [values, handleChange, setValues, errors, setErrors];
};

const fetchPost = async (postId) => {
	const response = await fetch(`${API_URL}/posts/editpage/${postId}`);
	if (!response.ok) {
		throw new Error("글을 불러오는데 실패했습니다.");
	}
	return response.json();
};

const updatePost = async (postId, data) => {
	console.log("----", "수정시작");

	const response = await fetch(`${API_URL}/posts/editPost/${postId}`, {
		method: "PUT",
		body: data,
		credentials: "include",
	});
	if (!response.ok) {
		throw new Error("글 수정에 실패했습니다.");
	}
	return response.json();
};

export default function EditPost() {
	const navigate = useNavigate();
	const { postId } = useParams();
	const [
		{ title, summary, files, content, cover },
		handleChange,
		setFormValues,
		errors,
		setErrors,
	] = useForm({
		title: "",
		summary: "",
		files: "",
		content: "",
		cover: "",
	});

	useEffect(() => {
		const getPost = async () => {
			try {
				const result = await fetchPost(postId);
				setFormValues({
					title: result.title,
					summary: result.summary,
					content: result.content,
					cover: result.cover,
					files: "",
				});
			} catch (error) {
				console.error(error);
				setErrors((prev) => ({ ...prev, fetch: error.message }));
			}
		};
		getPost();
	}, [postId, setFormValues, setErrors]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = {};
		if (!title) newErrors.title = "제목을 입력해 주세요";
		if (!summary) newErrors.summary = "요약내용을 입력해 주세요";
		if (!content) newErrors.content = "내용을 입력해 주세요";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		const data = new FormData();
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);
		if (files?.[0]) {
			data.set("files", files[0]);
		}

		try {
			const result = await updatePost(postId, data);
			if (result._id) {
				navigate(`/detail/${postId}`);
			}
		} catch (error) {
			console.error(error);
			setErrors((prev) => ({ ...prev, submit: error.message }));
		}
	};

	const handleEditorChange = useCallback(
		(value) => {
			setFormValues((prev) => ({ ...prev, content: value }));
			setErrors((prev) => ({ ...prev, content: "" }));
		},
		[setFormValues, setErrors]
	);

	return (
		<section className={style.CreatePost}>
			<h2>글 수정페이지</h2>
			{errors.fetch && <p className={style.error}>{errors.fetch}</p>}
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
				{errors.title && <p className={style.error}>{errors.title}</p>}
				<label htmlFor="summary">요약내용</label>
				<input
					type="text"
					id="summary"
					name="summary"
					placeholder="요약내용을 입력해 주세요 100자 이내"
					value={summary}
					onChange={handleChange}
				/>
				{errors.summary && (
					<p className={style.error}>{errors.summary}</p>
				)}
				<label htmlFor="files">파일첨부</label>
				<input
					type="file"
					id="files"
					name="files"
					onChange={handleChange}
				/>
				{cover && (
					<p className={style.smallimg}>
						<img src={`${API_URL}/${cover}`} alt="Cover" />
					</p>
				)}
				<label>내용</label>
				<ToastEditor
					initialValue={content}
					onChange={handleEditorChange}
				/>
				{errors.content && (
					<p className={style.error}>{errors.content}</p>
				)}
				{errors.submit && (
					<p className={style.error}>{errors.submit}</p>
				)}
				<button type="submit">등록</button>
			</form>
		</section>
	);
}
