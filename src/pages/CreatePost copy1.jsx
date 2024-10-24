import { useState } from "react";

import style from "../styles/CreatePost.module.css";
import ToastEditor from "../components/ToastEditor";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [files, setFiles] = useState("");
	const [content, setContent] = useState("");
	const navigate = useNavigate();

	// 백엔드로 데이터를 보내는 함수
	const createNewPost = async (e) => {
		e.preventDefault();
		console.log("버튼 클릭");

		// FormData 객체 생성
		const data = new FormData();
		// set과 append의 차이점
		// set은 같은 키값을 가지면 덮어쓰기를 하고
		// append는 같은 키값을 가지면 추가로 붙여준다.
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);
		data.append("files", files[0]); // files는 배열이기 때문에 0번째 인덱스를 사용

		// fetch 함수로 백엔드로 데이터 전송
		const respose = await fetch(
			`${import.meta.env.VITE_API_URL}/postWrite`,
			{
				method: "POST",
				body: data,
				credentials: "include", // 쿠키를 전송하기 위해 필요
			}
		);
		console.log(respose);

		// 응답이 성공적으로 왔을 때
		if (respose.ok) {
			//글 작성이 완료되면 홈으로 이동
			navigate("/");
		} else {
			alert("글 등록에 실패했습니다.");
		}
	};

	return (
		<section className={style.CreatePost}>
			<h2>글 작성페이지</h2>
			<form className={style.writecom} onSubmit={createNewPost}>
				<label htmlFor="title">제목</label>
				<input
					type="text"
					id="title"
					name="title"
					placeholder="제목을 입력해 주세요"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<label htmlFor="summary">요약내용</label>
				<input
					type="text"
					id="summary"
					name="summary"
					placeholder="요약내용을 입력해 주세요 100자 이내"
					value={summary}
					onChange={(e) => setSummary(e.target.value)}
				/>
				<label htmlFor="files">파일첨부</label>
				<input
					type="file"
					id="files"
					name="files"
					onChange={(e) => setFiles(e.target.files)}
				/>
				<label>내용</label>
				<ToastEditor initialValue={content} onChange={setContent} />
				<button>등록</button>
			</form>
		</section>
	);
}
