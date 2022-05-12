import React, { useEffect, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Assignment } from "../types/types";
import isPast from "date-fns/isPast";
import formatDistance from "date-fns/formatDistance";
import format from "date-fns/format";
import { EventEmitter, EventType } from "../components/EventEmitter";

interface IProps {
	assignment: Assignment;
	course_name?: string;
}

function Item(props: IProps) {
	const [progressColor, setProgressColor] = useState("#fdd835");
	const [dateText, setDateText] = useState("");

	useEffect(() => {
		let now = new Date();
		if (isPast(props.assignment.outDate)) {
			setDateText(
				`Due ${formatDistance(props.assignment.dueDate, now, {
					addSuffix: true,
				})} (${format(props.assignment.dueDate, "EEEE")})`
			);
		} else {
			setDateText(
				`Out ${formatDistance(props.assignment.outDate, now, {
					addSuffix: true,
				})} (${format(props.assignment.outDate, "EEEE")})`
			);
		}
	}, [props.assignment]);

	useEffect(() => {
		if (props.assignment.progress < 35) {
			setProgressColor("#fdd835");
		} else if (props.assignment.progress < 65) {
			setProgressColor("#aed581");
		} else {
			setProgressColor("#8bc34a");
		}
	}, [props.assignment.progress]);

	return (
		<div
			onClick={() => {
				EventEmitter.emit(EventType.OpenModal, { assignment: props.assignment });
			}}
			style={{
				userSelect: "none",
				height: "max-content",
				background: "#F5F5F5",
				borderRadius: 5,
				boxShadow: "0px 5px 5px rgba(0, 0, 0, 0.1)",
				padding: "20px 15px 20px 15px",
				cursor: "pointer",
			}}>
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<div style={{ fontSize: 18 }}>{props.assignment.assignment_name}</div>

				<div style={{ fontSize: 16, color: "#bdbdbd", fontWeight: 500 }}>
					{props.course_name}
				</div>
			</div>
			<div style={{ fontSize: 16, marginTop: 5 }}>{dateText}</div>
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
					value={props.assignment.progress}
					step={5}
					marks={{
						0: " ",
						35: " ",
						65: " ",
						100: " ",
					}}
				/>
			</div>
		</div>
	);
}

export default Item;
