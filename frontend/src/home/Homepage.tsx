import React from "react";
import Container from "./Container";

export default function Homepage() {
	return (
		<div
			style={{
				width: "max-content",
				height: "100%",
			}}>
			<div
				style={{
					width: "100vw",
					overflowX: "auto",
					display: "flex",
					flexDirection: "row",
				}}>
				<Container title="Active" />
				<Container title="ENGR101" />
				<Container title="CYBR171" />
			</div>
		</div>
	);
}
