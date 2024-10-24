import style from "../styles/CreatePost.module.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ToastEditor from "../components/ToastEditor";

export default function EditPost() {
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [files, setFiles] = useState("");
	const [content, setContent] = useState("");
	const [cover, setCover] = useState("");

	const [titleMessage, setTitleMessage] = useState("");
	const [summaryMessage, setSummaryMessage] = useState("");
	const [filesMessage] = useState("");
	const [contentMessage, setContentMessage] = useState("");

	const { postId } = useParams();

	//getPost함수를 이용해 postId에 해당하는 글의 정보를 가져온다
	//요청된 정보를 setTitle, setSummery, setContent를 이용해 상태에 저장하여 화면에 렌더링
	useEffect(() => {
		const getPost = async () => {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/editpage/${postId}`
			);
			const result = await response.json();
			console.log(result);

			setTitle(result.title);
			setSummary(result.summary);
			setContent(result.content);
			setCover(result.cover);
		};
		getPost();
	}, [postId]);

	const updatePost = async (e) => {
		e.preventDefault();
		if (title === "") {
			setTitleMessage("제목을 입력해 주세요");
			return;
		} else {
			setTitleMessage("");
		}
		if (summary === "") {
			setSummaryMessage("요약내용을 입력해 주세요");
			return;
		} else {
			setSummaryMessage("");
		}

		if (content === "") {
			setContentMessage("내용을 입력해 주세요");
			return;
		} else {
			setContentMessage("");
		}

		const data = new FormData();
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);

		//files가 없을 경우 기존 이미지를 사용하도록 설정
		if (files?.[0]) {
			data.set("files", files?.[0]);
		}

		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/editPost/${postId}`,
			{
				method: "PUT",
				body: data,
				credentials: "include",
			}
		);
		const result = await response.json();
		console.log(result);
		if (result.message === "ok") {
			navigate(`/detail/${postId}`);
		}
	};

	return (
		<section className={style.CreatePost}>
			<h2>글 수정페이지</h2>
			<form className={style.writecom} onSubmit={updatePost}>
				<label htmlFor="title">제목</label>
				<input
					type="text"
					id="title"
					name="title"
					placeholder="제목을 입력해 주세요"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<p>{titleMessage}</p>
				<label htmlFor="summary">요약내용</label>
				<input
					type="text"
					id="summary"
					name="summary"
					placeholder="요약내용을 입력해 주세요 100자 이내"
					value={summary}
					onChange={(e) => setSummary(e.target.value)}
				/>
				<p>{summaryMessage}</p>
				<label htmlFor="files">파일첨부</label>
				<input
					type="file"
					id="files"
					name="files"
					onChange={(e) => setFiles(e.target.files)}
				/>
				<p>{filesMessage}</p>
				<p className={style.smallimg}>
					<img
						src={`${import.meta.env.VITE_API_URL}/${cover}`}
						alt=""
					/>
				</p>
				<label>내용</label>
				<ToastEditor initialValue={content} onChange={setContent} />
				<p>{contentMessage}</p>
				<button>등록</button>
			</form>
		</section>
	);
}
