import style from "../styles/Layout.module.css";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { Outlet } from "react-router-dom";

export default function Layout() {
	return (
		<div className={style.wrap}>
			<Header />
			<Outlet />
			<Footer />
		</div>
	);
}
