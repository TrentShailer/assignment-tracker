import React from "react";
import Item from "./Item";

interface IProps {
	title: string;
}

export default function Container(props: IProps) {
	return (
		<div
			style={{
				width: 300,
				flexShrink: 0,
				padding: 20,
				margin: 20,
				background: "#E0E0E0",
				borderRadius: 5,
				boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
			}}>
			<div style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>{props.title}</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					overflowY: "auto",
					gap: 20,
				}}>
				<Item />
				<Item />
				<Item />
			</div>
		</div>
	);
}
