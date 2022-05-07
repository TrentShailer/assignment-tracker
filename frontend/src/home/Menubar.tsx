import React, { useEffect, useState } from "react";
import { IconType } from "../assets/Types/Icon";
import IconButton from "../components/IconButton";
import AccountMenu from "./AccountMenu";

export default function Menubar() {
	const [date, setDate] = useState<string>("");

	useEffect(() => {
		let now = new Date();
		setDate(now.toDateString());
	}, []);

	return (
		<div
			className="glass"
			style={{
				width: "100vw",
				height: 64,
				display: "flex",
				alignItems: "center",
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
