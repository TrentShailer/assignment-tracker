import axios from "axios";
import React, { useState } from "react";
import { EventEmitter, EventType } from "../components/EventEmitter";

interface IProps {
	course_id: string;
}

export default function AddItem(props: IProps) {
	const [showInput, setShowInput] = useState(false);
	const [title, setTitle] = useState("");

	const Create = () => {
		if (title) {
			axios
				.post("/assignment/new", {
					course_id: props.course_id,
					assignment_name: title,
				})
				.then((response) => {
					EventEmitter.emit(EventType.UpdatedAssignments);
				});
			setTitle("");
		}
	};

	return (
		<div
			onClick={() => {
				setShowInput(true);
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
			{showInput ? (
				<div>
					<input
						className="containerInput"
						style={{ width: 248, height: 42, paddingLeft: 16, paddingRight: 16 }}
						autoFocus
						onBlur={() => {
							setShowInput(false);
							Create();
						}}
						onChange={(e) => {
							setTitle(e.target.value);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								setShowInput(false);
								Create();
							}
						}}
						placeholder="Assignment Name"
					/>
				</div>
			) : (
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						background: "#CCCCCC",
						padding: 10,
						borderRadius: 5,
					}}>
					<svg width="24" height="24" viewBox="0 0 24 24">
						<path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
					</svg>
					<div
						style={{
							fontSize: 20,
							fontWeight: 500,
						}}>
						Add Assignment
					</div>
				</div>
			)}
		</div>
	);
}
