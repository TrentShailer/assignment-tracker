import React from "react";

export default function Background() {
	return (
		<div
			style={{
				position: "fixed",
				background: "url('background.svg')",
				width: "max(1920px, 100vw)",
				height: "max(1080px, 100vh)",
				backgroundSize: "cover",
				zIndex: -100,
			}}
		/>
	);
}
