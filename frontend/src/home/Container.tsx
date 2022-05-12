import React, { useState } from "react";
import Item from "./Item";
import "../index.css";
import { Course } from "../types/types";
import { countReset } from "console";
import ContainerTitle from "./ContainerTitle";
import axios from "axios";
import AddItem from "./AddItem";
import { EventEmitter, EventType } from "../components/EventEmitter";

interface IProps {
	course: Course;
}

export default function Container(props: IProps) {
	const [course, setCourse] = useState(props.course);

	const SaveChanges = (title: string) => {
		setCourse((course) => {
			course.course_name = title;
			axios.post("/course/update", {
				course_id: course.course_id,
				course_name: course.course_name,
			});
			return course;
		});
	};

	const handleDelete = () => {
		axios
			.post("/course/delete", {
				course_id: course.course_id,
			})
			.then((response) => {
				EventEmitter.emit(EventType.UpdatedAssignments);
			});
	};
	return (
		<div
			style={{
				width: 340,
				maxHeight: "80vh",
				height: "max-content",
				flexShrink: 0,
				margin: 20,
				background: "#E0E0E0",
				borderRadius: 5,
				boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
				scrollSnapAlign: "start",
				position: "relative",
			}}>
			<div
				onClick={handleDelete}
				style={{
					position: "absolute",
					right: 24,
					top: 24,
					cursor: "pointer",
				}}>
				<svg width="24" height="24" viewBox="0 0 24 24">
					<path
						fill="#ef5350"
						d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"
					/>
				</svg>
			</div>
			<ContainerTitle SaveChanges={SaveChanges} title={course.course_name} />
			<div
				style={{
					display: "flex",
					maxHeight: "calc(80vh - 128px)",
					flexDirection: "column",
					overflowY: "auto",
					overflowX: "visible",
					padding: "20px 15px 20px 15px",
					marginBottom: 20,
					gap: 20,
				}}>
				{props.course.assignments
					.sort((a, b) => {
						return b.outDate.getTime() - a.outDate.getTime();
					})
					.map((assignment) => {
						return <Item assignment={assignment} course_name={course.course_name} />;
					})}
				<AddItem course_id={course.course_id} />
			</div>
		</div>
	);
}
