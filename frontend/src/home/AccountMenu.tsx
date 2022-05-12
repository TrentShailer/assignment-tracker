import axios from "axios";
import React, { useEffect, useState } from "react";
import { IconType } from "../assets/Types/Icon";
import IconButton from "../components/IconButton";
import ConfirmMenu from "./ConfirmMenu";
import LogoutMenu from "./LogoutMenu";

export default function AccountMenu() {
	const [icon, setIcon] = useState(IconType.hamburgerMenu);
	const [username, setUsername] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [isConfirm, setIsConfirm] = useState(false);
	const [menu, setMenu] = useState<JSX.Element>(
		<LogoutMenu
			username={username}
			onDelete={() => {
				setIsConfirm(true);
			}}
		/>
	);

	useEffect(() => {
		if (isConfirm) {
			setMenu(
				<ConfirmMenu
					onCancel={() => {
						setIsConfirm(false);
					}}
				/>
			);
		} else {
			setMenu(
				<LogoutMenu
					username={username}
					onDelete={() => {
						setIsConfirm(true);
					}}
				/>
			);
		}
	}, [username, isConfirm]);

	useEffect(() => {
		if (isOpen) {
			setIcon(IconType.close);
		} else {
			setIsConfirm(false);
			setIcon(IconType.hamburgerMenu);
		}
	}, [isOpen]);

	useEffect(() => {
		axios.get("/username").then((result) => {
			setUsername(result.data.username);
		});
	}, []);

	return (
		<div style={{ position: "relative", userSelect: "none" }}>
			<IconButton
				onClick={() => {
					setIsOpen(!isOpen);
				}}
				icon={icon}
				size={48}
				color={"#4DB6AC"}
			/>
			{isOpen ? (
				<div className="menu" style={{ position: "absolute", right: 0, top: 75 }}>
					{menu}
				</div>
			) : null}
		</div>
	);
}
