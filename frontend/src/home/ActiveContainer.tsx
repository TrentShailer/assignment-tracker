import isPast from "date-fns/isPast";
import React, { useEffect, useState } from "react";
import { Assignment, Course } from "../types/types";
import Item from "./Item";

interface IProps {
	courses: Course[] | undefined;
}

export default function ActiveContainer(props: IProps) {
	const [assignments, setAssignments] = useState<Assignment[]>();
	useEffect(() => {
		if (!props.courses) return;

		let assign: Assignment[] = [];
		for (let i = 0; i < props.courses.length; i++) {
			for (let j = 0; j < props.courses[i].assignments.length; j++) {
				assign.push({
					...props.courses[i].assignments[j],
					course_name: props.courses[i].course_name,
				});
			}
		}
		assign.sort((a, b) => {
			return a.dueDate.getTime() - b.dueDate.getTime();
		});
		setAssignments(assign);
	}, [props.courses]);
	return (
		<div
			style={{
				width: 340,
				maxHeight: "80vh",
				flexShrink: 0,
				height: "max-content",
				margin: 20,
				background: "#E0E0E0",
				borderRadius: 5,
				boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
			}}>
			<div
				style={{
					fontSize: 20,
					fontWeight: 500,
					cursor: "text",
				}}>
				<div style={{ padding: "21px 20px 5px 30px" }}>Active</div>
			</div>
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
				{assignments?.map((assignment) => {
					if (
						isPast(assignment.outDate) &&
						!isPast(assignment.dueDate) &&
						assignment.progress !== 100
					) {
						return (
							<Item assignment={assignment} course_name={assignment.course_name} />
						);
					}
					return false;
				})}
			</div>
		</div>
	);
}
