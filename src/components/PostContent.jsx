import style from "../styles/PostContent.module.css";
import { Viewer } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

export default function PostContent({ summary, content }) {
	return (
		<>
			<div className={style.summary}>{summary}</div>
			<div className={style.desc}>
				<Viewer initialValue={content} />
			</div>
		</>
	);
}
