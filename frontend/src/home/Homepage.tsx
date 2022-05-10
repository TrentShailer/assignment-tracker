import React, { useEffect } from "react";
import AddContainer from "./AddContainer";
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
				<Container notEditable={true} title="Active" />
				<Container title="ENGR101" />
				<Container title="CYBR171" />
				<AddContainer />
			</div>
		</div>
	);
}
