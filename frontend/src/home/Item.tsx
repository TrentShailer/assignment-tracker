import React, { useEffect, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface IProps {}

function Item(props: IProps) {
	const [progress, setProgress] = useState(0);
	const [progressColor, setProgressColor] = useState("#fdd835");
	useEffect(() => {
		if (progress < 60) {
			setProgressColor("#fdd835");
		} else if (progress < 85) {
			setProgressColor("#aed581");
		} else {
			setProgressColor("#8bc34a");
		}
	}, [progress]);

	return (
		<div
			style={{
				userSelect: "none",
				height: "max-content",
				background: "#F5F5F5",
				borderRadius: 5,
				boxShadow: "0px 5px 5px rgba(0, 0, 0, 0.1)",
				padding: "20px 15px 20px 15px",
				cursor: "pointer",
			}}>
			<div style={{ fontSize: 18 }}>ENGR121 Assignment 6</div>
			<div style={{ fontSize: 18, marginTop: 5 }}>Due in: 5 days</div>
			<div
				style={{
					paddingLeft: 5,
					paddingRight: 5,
					marginTop: 10,
				}}>
				<Slider
					disabled
					trackStyle={{ backgroundColor: progressColor }}
					handleStyle={{ opacity: "0", cursor: "pointer" }}
					onChange={(v) => {
						if (typeof v === "number") {
							setProgress(v);
						}
					}}
					step={5}
					marks={{ 0: " ", 33: " ", 66: " ", 100: " " }}
				/>
			</div>
		</div>
	);
}

export default Item;
