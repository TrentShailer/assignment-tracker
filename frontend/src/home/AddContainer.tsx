import React, { useState } from "react";

export default function AddContainer() {
	const [showInput, setShowInput] = useState(false);
	const [title, setTitle] = useState("");
	return (
		<div
			onClick={() => {
				setShowInput(true);
			}}
			style={{
				width: 340,
				height: "max-content",
				cursor: "pointer",
				flexShrink: 0,
				margin: 20,
				background: "#E0E0E0",
				borderRadius: 5,
				padding: 15,
				boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
			}}>
			{showInput ? (
				<div>
					<input
						className="containerInput"
						style={{ width: 308, height: 42, paddingLeft: 16, paddingRight: 16 }}
						autoFocus
						onBlur={() => {
							setShowInput(false);
						}}
						onChange={(e) => {
							setTitle(e.target.value);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setShowInput(false);
							}
						}}
						placeholder="Course Name"
					/>
				</div>
			) : (
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						background: "#CCCCCC",
						padding: 10,
						borderRadius: 5,
					}}>
					<svg width="24" height="24" viewBox="0 0 24 24">
						<path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
					</svg>
					<div
						style={{
							fontSize: 20,
							fontWeight: 500,
						}}>
						Add Course
					</div>
				</div>
			)}
		</div>
	);
}
