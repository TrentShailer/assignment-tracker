import React, { useState } from "react";

interface IProps {
	children?: any;
	onClick?: Function;
}

export default function Button(props: IProps) {
	const [background, setBackground] = useState("#E0E0E0");
	return (
		<div
			onMouseEnter={() => {
				setBackground("#eeeeee");
			}}
			onMouseLeave={() => {
				setBackground("#E0E0E0");
			}}
			onMouseDown={() => {
				setBackground("#E0E0E0");
			}}
			onMouseUp={() => {
				setBackground("#eeeeee");
			}}
			onClick={() => {
				if (props.onClick) props.onClick();
			}}
			style={{
				cursor: "pointer",
				background: background,
				paddingLeft: 18,
				paddingRight: 18,
				paddingTop: 8,
				paddingBottom: 8,
				borderRadius: 32,
				height: 24,
				fontSize: 18,
				userSelect: "none",
			}}>
			{props.children}
		</div>
	);
}
