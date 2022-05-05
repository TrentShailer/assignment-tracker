import React from "react";

export default function Background() {
	return (
		<div
			style={{
				position: "fixed",
				background: "url('background.svg')",
				width: "100vw",
				height: "100vh",
				backgroundSize: "cover",
				zIndex: -100,
			}}
		/>
	);
}
