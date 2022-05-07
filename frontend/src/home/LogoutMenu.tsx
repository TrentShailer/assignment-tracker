import React from "react";
import { IconType } from "../assets/Types/Icon";
import IconButton from "../components/IconButton";

interface IProps {
	onDelete: Function;
}

function LogoutMenu(props: IProps) {
	return (
		<div style={{ width: 200 }}>
			<div style={{ color: "#fff", fontSize: 20, marginBottom: 10 }}>trentshailer</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
				}}>
				<IconButton
					onClick={props.onDelete}
					icon={IconType.removeAccount}
					color={"#F44336"}
					size={48}
				/>
				<IconButton
					onClick={() => {
						window.location.href = "/logout";
					}}
					icon={IconType.logout}
					color={"#E57373"}
					size={48}
				/>
			</div>
		</div>
	);
}

export default LogoutMenu;
