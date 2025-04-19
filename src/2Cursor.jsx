import React from "react";

const Cursor = ({ x, y, color, name }) => {
	return (
		<div
			style={{
				position: "absolute",
				left: 0,
				top: 0,
				transform: `translate(${x}px, ${y}px)`,
				zIndex: 1000,
				pointerEvents: "none",
			}}
		>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M1 1L10.07 20.51L13.13 13.13L20.51 10.07L1 1Z" fill={color} stroke="white" strokeWidth="2" />
			</svg>
			{name && (
				<div
					style={{
						background: color,
						color: "#fff",
						padding: "2px 6px",
						borderRadius: "4px",
						fontSize: "12px",
						marginTop: "2px",
						whiteSpace: "nowrap",
					}}
				>
					{name}
				</div>
			)}
		</div>
	);
};

export default Cursor;
