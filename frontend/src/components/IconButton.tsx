import React, { useState } from "react";
import { IconType } from "../assets/Types/Icon";
import Icon from "./Icon";

// from https://gist.github.com/renancouto/4675192
var LightenColor = function (color: string, percent: number) {
	var num = parseInt(color.substring(1, color.length), 16),
		amt = Math.round(2.55 * percent),
		R = (num >> 16) + amt,
		B = ((num >> 8) & 0x00ff) + amt,
		G = (num & 0x0000ff) + amt;

	return (
		0x1000000 +
		(R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
		(B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
		(G < 255 ? (G < 1 ? 0 : G) : 255)
	)
		.toString(16)
		.slice(1);
};

function IconButton(props: IProps) {
	const [shadow, setShadow] = useState<string>("0px 0px 10px rgba(0, 0, 0, 0.5)");
	const [color, setColor] = useState<string>(props.color);

	const handleHover = () => {
		setColor("#" + LightenColor(props.color, 10));
	};
	const handleLeave = () => {
		setColor(props.color);
	};

	const handleDown = () => {
		setColor(props.color);
		setShadow("0px 0px 5px rgba(0, 0, 0, 0.5)");
		props.onClick();
	};

	const handleUp = () => {
		setColor("#" + LightenColor(props.color, 10));
		setShadow("0px 0px 10px rgba(0, 0, 0, 0.5)");
	};

	return (
		<div
			onMouseEnter={handleHover}
			onMouseLeave={handleLeave}
			onMouseDown={handleDown}
			onMouseUp={handleUp}
			style={{
				cursor: "pointer",
				width: props.size,
				height: props.size,
				borderRadius: "50%",
				background: color,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				boxShadow: shadow,
			}}>
			<div style={{ width: props.size / 1.5, height: props.size / 1.5 }}>
				<Icon icon={props.icon} size={props.size / 1.5} color="#fff" />
			</div>
		</div>
	);
}

interface IProps {
	icon: IconType;
	size: number;
	color: string;
	onClick: Function;
}

export default IconButton;
