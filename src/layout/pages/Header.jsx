import { useNavigate } from "react-router-dom";

const Header = () => {
	const navigate = useNavigate();

	return (
		<header
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				padding: "10px 20px",
				backgroundColor: "#f0f0f0",
				borderBottom: "1px solid #e0e0e0",
				height: "50px",
				width: "100%",
				boxSizing: "border-box",
			}}
		>
			<div
				onClick={() => {
					navigate("/");
				}}
				style={{ fontWeight: "bold", fontSize: "1.2rem", cursor: "pointer" }}
			>
				Busy-Cards
			</div>
			<nav>
				<ul
					style={{
						display: "flex",
						listStyle: "none",
						gap: "15px",
						margin: 0,
						padding: 0,
					}}
				>
					<a href="#" style={{ textDecoration: "none", color: "#333" }}>
						Home
					</a>
					<a href="#" style={{ textDecoration: "none", color: "#333" }}>
						Projects
					</a>
					<a href="#" style={{ textDecoration: "none", color: "#333" }}>
						Help
					</a>
				</ul>
			</nav>
		</header>
	);
};

export default Header;
