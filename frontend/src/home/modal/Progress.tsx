import Slider from "rc-slider";
import React, { useEffect, useState } from "react";

interface IProps {
	progress: number;
	SaveChanges: Function;
}

let timeout = setTimeout(() => {}, 100);

export default function Progress(props: IProps) {
	const [progress, setProgress] = useState(props.progress);
	const [progressColor, setProgressColor] = useState("#fdd835");

	useEffect(() => {
		if (progress < 35) {
			setProgressColor("#fdd835");
		} else if (progress < 65) {
			setProgressColor("#aed581");
		} else {
			setProgressColor("#8bc34a");
		}

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			props.SaveChanges({ progress: progress });
		}, 1000);
	}, [progress]);

	return (
		<div
			style={{
				width: "calc(100% - 20px)",
				marginTop: 40,
				marginLeft: 10,
				marginRight: 10,
				marginBottom: 40,
			}}>
			<div style={{ marginBottom: 10 }}>Progress:</div>
			<Slider
				trackStyle={{ backgroundColor: progressColor }}
				onChange={(v) => {
					if (typeof v === "number") {
						setProgress(v);
					}
				}}
				defaultValue={progress}
				step={5}
				marks={{
					0: "Core",
					35: "Completion",
					65: "Challenge",
					100: "Completed",
				}}
			/>
		</div>
	);
}
