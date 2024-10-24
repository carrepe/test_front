import style from "../styles/PostImage.module.css";
const API_URL = import.meta.env.VITE_API_URL;

export default function PostImage({ cover, title }) {
	return (
		<div className={style.detailimg}>
			<img src={`${API_URL}/${cover}`} alt={title} />
			<h3>{title}</h3>
		</div>
	);
}
