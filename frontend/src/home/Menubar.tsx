import React, { useEffect, useState } from "react";
import { IconType } from "../assets/Types/Icon";
import IconButton from "../components/IconButton";
import AccountMenu from "./AccountMenu";

let interval = setInterval(() => {}, 1000 * 60);

export default function Menubar() {
	const [date, setDate] = useState<string>("");

	useEffect(() => {
		clearInterval(interval);
		let now = new Date();
		setDate(now.toDateString());
		interval = setInterval(() => {
			let now = new Date();
			setDate(now.toDateString());
		}, 1000 * 60);
	}, []);

	return (
		<div
			className="glass"
			style={{
				width: "100vw",
				height: 64,
				display: "flex",
				alignItems: "center",
				zIndex: 100,
			}}>
			<div
				style={{
					width: "100%",
					paddingLeft: 20,
					paddingRight: 20,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}>
				<div style={{ color: "#fff", fontSize: 24 }}>{date}</div>
				<AccountMenu />
			</div>
		</div>
	);
}
