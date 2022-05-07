import axios from "axios";
import React, { useState } from "react";
import { IconType } from "../assets/Types/Icon";
import IconButton from "../components/IconButton";

interface IProps {
	onCancel: Function;
}

function ConfirmMenu(props: IProps) {
	const [errorText, setErrorText] = useState("");

	const Confirm = () => {
		axios
			.delete("/account")
			.then((response) => {
				let reply = response.data;
				setErrorText("");
				if (reply.success) {
					window.location.href = "/logout";
				} else {
					setErrorText(reply.message);
				}
			})
			.catch((error) => {
				setErrorText("Something went wrong.");
			});
	};

	return (
		<div style={{ width: "min(80vw, 40vh)" }}>
			<div style={{ color: "#fff", fontSize: 20, marginBottom: 10 }}>
				Are you sure you wish to delete this account?
			</div>
			<div style={{ color: "#F44336", fontSize: 18, marginBottom: 10 }}>{errorText}</div>
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					gap: 20,
				}}>
				<IconButton
					onClick={props.onCancel}
					icon={IconType.close}
					color={"#757575"}
					size={48}
				/>
				<IconButton onClick={Confirm} icon={IconType.tick} color={"#F44336"} size={48} />
			</div>
		</div>
	);
}

export default ConfirmMenu;
