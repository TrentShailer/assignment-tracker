import React, { useState } from "react";
import Item from "./Item";
import "../index.css";

interface IProps {
	title: string;
	notEditable?: boolean;
}

export default function Container(props: IProps) {
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [title, setTitle] = useState(props.title);

	return (
		<div
			style={{
				width: 340,
				maxHeight: "80vh",
				flexShrink: 0,
				margin: 20,
				background: "#E0E0E0",
				borderRadius: 5,
				boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
			}}>
			<div
				onClick={() => {
					if (!props.notEditable) setIsEditingTitle(true);
				}}
				style={{
					fontSize: 20,
					fontWeight: 500,
					cursor: "text",
				}}>
				{isEditingTitle ? (
					<div
						style={{
							paddingTop: 19,
							paddingLeft: 20,
							paddingRight: 20,
							paddingBottom: 3,
						}}>
						<input
							className="containerInput"
							style={{
								width: 268,
							}}
							autoFocus
							onChange={(e) => {
								setTitle(e.target.value);
							}}
							onBlur={() => {
								setIsEditingTitle(false);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setIsEditingTitle(false);
								}
							}}
							defaultValue={title}
						/>
					</div>
				) : (
					<div style={{ padding: "21px 20px 5px 30px" }}>{title}</div>
				)}
			</div>
			<div
				style={{
					display: "flex",
					maxHeight: "calc(80vh - 128px)",
					flexDirection: "column",
					overflowY: "auto",
					overflowX: "visible",
					padding: "20px 15px 20px 15px",
					marginBottom: 20,
					gap: 20,
				}}>
				<Item />
				<Item />
			</div>
		</div>
	);
}
