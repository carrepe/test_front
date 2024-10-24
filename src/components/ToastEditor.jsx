import { useRef, useEffect } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

export default function ToastEditor({ initialValue, onChange }) {
	const editorRef = useRef(null);

	useEffect(() => {
		if (editorRef.current) {
			const instance = editorRef.current.getInstance();

			// 에디터 내용을 초기화합니다.
			instance.setMarkdown(initialValue || "");

			// placeholder를 설정합니다.
			instance.setPlaceholder("이곳에 글을 입력하세요");

			// change 이벤트 리스너를 추가합니다.
			const changeHandler = () => {
				const content = instance.getMarkdown();
				onChange(content);
			};

			instance.off("change", changeHandler);
			instance.on("change", changeHandler);

			// 컴포넌트가 언마운트될 때 이벤트 리스너를 제거합니다.
			return () => {
				instance.off("change", changeHandler);
			};
		}
	}, [onChange, initialValue]);

	// 이미지와 파일 업로드 옵션을 제외한 툴바 아이템 정의
	const toolbarItems = [
		["heading", "bold", "italic", "strike"],
		["hr", "quote"],
		["ul", "ol", "task", "indent", "outdent"],
		["table", "link"],
		["code", "codeblock"],
	];

	return (
		<Editor
			// 초기 내용 설정. 값이 없으면 빈 문자열 사용
			initialValue={initialValue || ""}
			// 미리보기 스타일 설정. 'vertical'은 에디터와 미리보기를 세로로 나란히 배치
			previewStyle="vertical"
			// 에디터의 높이 설정
			height="600px"
			// 초기 편집 모드 설정. 'wysiwyg'은 위지윅 모드, 'markdown'은 마크다운 모드
			initialEditType="wysiwyg"
			// 단축키 사용 여부 설정
			useCommandShortcut={true}
			// 에디터 인스턴스에 접근하기 위한 ref
			ref={editorRef}
			// 툴바에 표시할 아이템 설정
			toolbarItems={toolbarItems}
			// 자동 링크 확장 기능 사용 여부
			extendedAutolinks={true}
			// 마크다운/위지윅 모드 전환 버튼 숨김 여부
			hideModeSwitch={false}
			// Toast UI 사용 통계 수집 비활성화
			usageStatistics={false}
		/>
	);
}
